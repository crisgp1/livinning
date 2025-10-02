// ============================================
// LIVINNING - Modelo Subscription
// ============================================

import { ObjectId } from 'mongodb';
import { getCollection } from '../mongodb';
import { SubscriptionDocument } from '@/types/database';
import { Subscription } from '@/types';
import { COLLECTIONS } from '@/lib/utils/constants';

export function subscriptionDocumentToSubscription(doc: SubscriptionDocument): Subscription {
  return {
    id: doc._id.toString(),
    agencyId: doc.agencyId.toString(),
    plan: doc.plan,
    status: doc.status,
    stripeCustomerId: doc.stripeCustomerId,
    stripeSubscriptionId: doc.stripeSubscriptionId,
    startDate: doc.startDate,
    endDate: doc.endDate,
    cancelledAt: doc.cancelledAt,
    referredBy: doc.referredBy?.toString(),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function findSubscriptionById(id: string): Promise<Subscription | null> {
  try {
    const collection = await getCollection<SubscriptionDocument>(COLLECTIONS.SUBSCRIPTIONS);
    const doc = await collection.findOne({ _id: new ObjectId(id) });
    return doc ? subscriptionDocumentToSubscription(doc) : null;
  } catch (error) {
    console.error('Error finding subscription:', error);
    return null;
  }
}

export async function findSubscriptionByAgencyId(agencyId: string): Promise<Subscription | null> {
  try {
    const collection = await getCollection<SubscriptionDocument>(COLLECTIONS.SUBSCRIPTIONS);
    const doc = await collection.findOne({ agencyId: new ObjectId(agencyId), status: 'active' });
    return doc ? subscriptionDocumentToSubscription(doc) : null;
  } catch (error) {
    console.error('Error finding subscription by agency:', error);
    return null;
  }
}

export async function createSubscription(
  subscriptionData: Omit<SubscriptionDocument, '_id' | 'createdAt' | 'updatedAt'>
): Promise<Subscription> {
  const collection = await getCollection<SubscriptionDocument>(COLLECTIONS.SUBSCRIPTIONS);

  const now = new Date();
  const doc: Omit<SubscriptionDocument, '_id'> = {
    ...subscriptionData,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(doc as any);
  const newSubscription = await collection.findOne({ _id: result.insertedId });

  if (!newSubscription) {
    throw new Error('Error creating subscription');
  }

  return subscriptionDocumentToSubscription(newSubscription);
}

export async function updateSubscription(
  id: string,
  updates: Partial<Omit<SubscriptionDocument, '_id' | 'createdAt'>>
): Promise<Subscription | null> {
  try {
    const collection = await getCollection<SubscriptionDocument>(COLLECTIONS.SUBSCRIPTIONS);

    const result = await collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );

    return result ? subscriptionDocumentToSubscription(result) : null;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return null;
  }
}

export async function cancelSubscription(id: string): Promise<Subscription | null> {
  return updateSubscription(id, {
    status: 'cancelled',
    cancelledAt: new Date(),
  });
}

export async function listSubscriptions(filters: {
  status?: string;
  referredBy?: string;
  page?: number;
  limit?: number;
}): Promise<{ subscriptions: Subscription[]; total: number }> {
  const collection = await getCollection<SubscriptionDocument>(COLLECTIONS.SUBSCRIPTIONS);

  const query: any = {};

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.referredBy) {
    query.referredBy = new ObjectId(filters.referredBy);
  }

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
    collection.countDocuments(query),
  ]);

  return {
    subscriptions: docs.map(subscriptionDocumentToSubscription),
    total,
  };
}
