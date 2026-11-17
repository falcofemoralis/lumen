import { NotificationInterface } from 'Type/Notification.interface';

export const resolveNotificationCards = async (
  notifications: NotificationInterface[],
  cached: NotificationInterface[],
  resolve: (items: NotificationInterface[]) => Promise<NotificationInterface[]>,
  publish: (items: NotificationInterface[]) => void
): Promise<NotificationInterface[]> => {
  const cards = new Map(cached.flatMap(group => group.items)
    .filter(item => item.film?.id).map(item => [item.link, item.film!]));
  for (const item of notifications.flatMap(group => group.items)) {
    if (item.film?.id) cards.set(item.link, item.film);
  }
  const snapshot = () => notifications.map(group => ({
    ...group,
    items: group.items.filter(item => cards.has(item.link)).map(item => ({
      ...item, film: { ...cards.get(item.link)!, info: item.info },
    })),
  })).filter(group => group.items.length);
  const pending = Array.from(new Map(notifications.flatMap(group => group.items)
    .filter(item => !cards.has(item.link)).map(item => [item.link, item])).values());
  const ready = snapshot();
  if (ready.length) publish(ready);
  for (let offset = 0; offset < pending.length; offset += 3) {
    const resolved = await resolve([{ date: '', items: pending.slice(offset, offset + 3) }]);
    for (const item of resolved.flatMap(group => group.items)) {
      if (item.film?.id) cards.set(item.link, item.film);
    }
    publish(snapshot());
  }

  return snapshot();
};