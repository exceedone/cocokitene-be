export enum PlanEnum {
    FREE = 'free',
    TRIAL = 'trial',
    PAY_OF_MONTH = 'pay_of_month',
}

export enum SubscriptionEnum {
    // EXTEND = 'extend',
    // UPGRADE = 'upgrade',
    EXTEND = '0',
    UPGRADE = '1',
    CHANGE_SERVICE = '2',
}

export enum PaymentMethod {
    // DIRECT_PAYMENT = 'direct_payment',
    // BANK_TRANSFER = 'bank_transfer',
    DIRECT_PAYMENT = '0',
    BANK_TRANSFER = '1',
}

export enum StatusSubscription {
    // PENDING = 'pending',
    // CONFIRMED = 'confirmed',
    // CANCEL = 'cancel',
    PENDING = '0',
    CONFIRMED = '1',
    CANCEL = '2',
    APPLIED = '3',
}

export enum FlagResolve {
    RESOLVE = '1',
    PENDING = '2',
}
