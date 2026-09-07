import {
  assertValidCommerceEvent,
  type BehavioralEvent,
  type CommerceEvent,
  type OrderItemPayload,
} from "@ci/commerce";
import type { SimulationConfig, UserPersona } from "../config/simulation-config";
import type { SimulationProgressListener } from "../config/simulation-progress";
import type { SimulationScenario } from "../config/simulation-scenario";
import { SeededRandom } from "../random/seeded-random";
import { Timeline } from "../timeline/timeline";
import { SimulationCausalClock } from "./simulation-causal-clock";
import { SimulationEventFactory } from "./simulation-event-factory";
import { SimulationIdFactory } from "./simulation-id-factory";

export interface SimulationChunk {
  chunkIndex: number;
  userStart: number;
  userEnd: number;
  events: SimulationEvent[];
}

export interface SimulationResult {
  totalUsers: number;
  totalEvents: number;
  events: SimulationEvent[];
}

export type SimulationEvent = CommerceEvent | BehavioralEvent;

export class SimulationGenerator {
  private readonly random: SeededRandom;
  private readonly timeline: Timeline;
  private readonly ids: SimulationIdFactory;
  private readonly events: SimulationEventFactory;
  private readonly clock: SimulationCausalClock;

  constructor(
    private readonly config: SimulationConfig,
    private readonly scenario: SimulationScenario,
  ) {
    this.random = new SeededRandom(config.seed);
    this.timeline = new Timeline(config.startAt, config.days);
    this.ids = new SimulationIdFactory(`simulation-${config.seed}`);
    this.events = new SimulationEventFactory(config.tenantId);
    this.clock = new SimulationCausalClock(this.timeline, this.random);
  }

  public *generateChunks(onProgress?: SimulationProgressListener): Generator<SimulationChunk> {
    const chunkSize = this.config.chunkSize;
    const totalChunks = Math.ceil(this.config.totalUsers / chunkSize);

    let eventsGenerated = 0;

    for (
      let userStart = 0, chunkIndex = 0;
      userStart < this.config.totalUsers;
      userStart += chunkSize, chunkIndex += 1
    ) {
      const userEnd = Math.min(userStart + chunkSize, this.config.totalUsers);

      const events: SimulationEvent[] = [];

      for (let userIndex = userStart; userIndex < userEnd; userIndex += 1) {
        const userEvents = this.generateUser(userIndex);

        for (const event of userEvents) {
          assertValidCommerceEvent(event);
          events.push(event);
        }
      }

      events.sort(compareEvents);

      eventsGenerated += events.length;

      const chunk: SimulationChunk = {
        chunkIndex,
        userStart,
        userEnd,
        events,
      };

      onProgress?.({
        chunkIndex,
        totalChunks,
        usersProcessed: userEnd,
        totalUsers: this.config.totalUsers,
        eventsGenerated,
      });

      yield chunk;
    }
  }

  public generateAll(): SimulationResult {
    const events: SimulationEvent[] = [];

    for (const chunk of this.generateChunks()) {
      events.push(...chunk.events);
    }

    events.sort(compareEvents);

    return {
      totalUsers: this.config.totalUsers,
      totalEvents: events.length,
      events,
    };
  }

  private generateUser(userIndex: number): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    const customerId = `customer-${userIndex + 1}`;
    const visitorId = `visitor-${userIndex + 1}`;
    const persona = this.pickPersona();

    const registrationDayOffset = this.random.integer(0, Math.max(0, this.config.days - 1));
    const registrationAt = Date.parse(this.timeline.atDayOffset(registrationDayOffset));

    events.push(
      this.events.customerRegistered(this.ids.next(), customerId, registrationAt, {
        email: `${customerId}@example.test`,
        country: this.random.pick(["ID", "SG", "MY", "US"]),
        source: this.random.pick(["organic", "paid", "social", "referral"]),
      }),
    );

    const sessionRange = this.scenario.behavior.sessionCount[persona];

    const sessionCount = this.random.integer(sessionRange[0], sessionRange[1]);

    let sessionBaseOffset = registrationDayOffset;

    for (let sessionIndex = 0; sessionIndex < sessionCount; sessionIndex += 1) {
      const sessionEvents = this.generateSession(
        customerId,
        visitorId,
        persona,
        sessionIndex,
        sessionBaseOffset,
      );

      events.push(...sessionEvents);

      sessionBaseOffset = Math.min(
        sessionBaseOffset + this.random.integer(1, 5),
        Math.max(0, this.config.days - 1),
      );
    }

    return events;
  }

  private generateSession(
    customerId: string,
    visitorId: string,
    persona: UserPersona,
    sessionIndex: number,
    dayOffset: number,
  ): SimulationEvent[] {
    const events: SimulationEvent[] = [];

    const sessionId = `${customerId}-session-${sessionIndex + 1}`;

    const sessionStartedAt = Date.parse(this.timeline.atDayOffset(dayOffset));

    events.push(
      this.events.sessionStarted(this.ids.next(), sessionStartedAt, {
        sessionId,
        visitorId,
        customerId,
        landingPage: this.random.pick(["/", "/shop", "/category/electronics", "/category/fashion"]),
        source: this.random.pick(["organic", "paid", "social", "referral"]),
        medium: this.random.pick(["search", "cpc", "social", "email"]),
        campaign: this.random.pick(["none", "summer", "retargeting", "welcome"]),
      }),
    );

    const viewRange = this.scenario.behavior.productViewCount[persona];

    const viewCount = this.random.integer(viewRange[0], viewRange[1]);

    const viewTimes = this.clock.createSequence(sessionStartedAt, viewCount);

    for (const viewedAt of viewTimes) {
      events.push(
        this.events.productViewed(this.ids.next(), viewedAt, {
          sessionId,
          visitorId,
          customerId,
          productId: this.random.pick(this.config.products).id,
        }),
      );
    }

    const shouldAddToCart = this.random.next() < this.scenario.behavior.cartProbability[persona];

    const lastViewedAt = viewTimes.at(-1);

    if (!shouldAddToCart || lastViewedAt === undefined) {
      return events;
    }

    const cartAt = this.clock.advance(lastViewedAt, 10, 180);

    const productId = this.random.pick(this.config.products).id;
    const quantity = this.random.integer(1, 3);

    events.push(
      this.events.cartItemAdded(this.ids.next(), cartAt, {
        sessionId,
        visitorId,
        customerId,
        productId,
        quantity,
      }),
    );

    const shouldCheckout = this.random.next() < this.scenario.behavior.checkoutProbability[persona];

    if (!shouldCheckout) {
      return events;
    }

    const checkoutAt = this.clock.checkout(cartAt);

    events.push(
      this.events.checkoutStarted(this.ids.next(), checkoutAt, {
        sessionId,
        visitorId,
        customerId,
        itemCount: quantity,
        merchandiseValue: this.getProductPrice(productId) * quantity,
        currency: "IDR",
      }),
    );

    const shouldPurchase = this.random.next() < this.scenario.behavior.purchaseProbability[persona];

    if (!shouldPurchase) {
      return events;
    }

    const orderPlacedAt = this.clock.orderPlaced(checkoutAt);
    const orderPaidAt = this.clock.orderPaid(orderPlacedAt);

    const orderId = `${customerId}-order-${this.ids.next()}`;

    const unitPrice = this.getProductPrice(productId);

    const item: OrderItemPayload = {
      productId,
      quantity,
      unitPrice,
    };

    const subtotal = unitPrice * quantity;
    const discount = 0;
    const tax = subtotal * 0.1;
    const shipping = 0;
    const total = subtotal + tax;

    events.push(
      this.events.orderPlaced(this.ids.next(), orderPlacedAt, {
        orderId,
        customerId,
        currency: "IDR",
        items: [item],
        subtotal,
        discount,
        tax,
        shipping,
        total,
      }),
    );

    const shouldCancel = this.random.next() < this.scenario.behavior.cancellationProbability;

    if (shouldCancel) {
      const cancelledAt = this.clock.orderCancelled(orderPlacedAt);

      events.push(
        this.events.orderCancelled(this.ids.next(), cancelledAt, {
          orderId,
          customerId,
          reason: this.random.pick(["customer_request", "payment_timeout", "inventory_issue"]),
        }),
      );

      return events;
    }

    events.push(
      this.events.orderPaid(this.ids.next(), orderPaidAt, {
        orderId,
        customerId,
        currency: "IDR",
        amount: total,
      }),
    );

    const shouldRefund = this.random.next() < this.scenario.behavior.refundProbability;

    if (!shouldRefund) {
      return events;
    }

    const refundAt = this.clock.refundIssued(orderPaidAt);

    const isPartial = this.random.next() < this.scenario.behavior.refundPartialProbability;

    const refundAmount = isPartial ? Math.max(1, Number((total * 0.5).toFixed(2))) : total;

    events.push(
      this.events.refundIssued(this.ids.next(), refundAt, {
        refundId: `${orderId}-refund`,
        orderId,
        customerId,
        currency: "IDR",
        amount: refundAmount,
        reason: this.random.pick(["customer_request", "damaged_item", "wrong_item", "fraud"]),
      }),
    );

    return events;
  }

  private pickPersona(): UserPersona {
    return this.random.weighted(
      Object.entries(this.scenario.behavior.personaDistribution).map(([value, weight]) => ({
        value: value as UserPersona,
        weight,
      })),
    );
  }

  private getProductPrice(productId: string): number {
    const product = this.config.products.find((candidate) => candidate.id === productId);

    if (!product) {
      throw new Error(`Unknown simulation product: ${productId}`);
    }

    return product.price;
  }
}

function compareEvents(a: SimulationEvent, b: SimulationEvent): number {
  const timeComparison = Date.parse(a.occurredAt) - Date.parse(b.occurredAt);

  if (timeComparison !== 0) {
    return timeComparison;
  }

  return a.id.localeCompare(b.id);
}
