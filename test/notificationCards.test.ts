import assert from 'node:assert/strict';
import { test } from 'node:test';
import { resolveNotificationCards } from '../src/screen/NotificationsScreen/NotificationsScreen.resolve';
import { NotificationInterface } from '../src/type/Notification.interface';
import { FilmCardInterface } from '../src/type/FilmCard.interface';

const card = (id: string) => ({ id, link: id, title: id } as FilmCardInterface);
test('notifications publish cached cards and each bounded batch before the next resolves', async () => {
  const notifications = [{ date: 'Today', items: Array.from({ length: 5 }, (_, index) => ({
    link: String(index), name: String(index), info: 'New episode',
  })) }];
  const published: NotificationInterface[][] = [];
  const batches: number[] = [];
  const result = await resolveNotificationCards(notifications,
    [{ date: 'Yesterday', items: [{ link: '0', name: '0', film: card('0') }] }],
    async groups => {
      batches.push(groups[0].items.length);
      assert.equal(published.length, batches.length);
      return groups.map(group => ({ ...group, items: group.items.map(item => ({ ...item, film: card(item.link) })) }));
    }, items => published.push(items));
  assert.deepEqual(batches, [3, 1]);
  assert.deepEqual(published.map(groups => groups[0].items.length), [1, 4, 5]);
  assert.equal(result[0].date, 'Today');
  assert.equal(result[0].items[0].film?.info, 'New episode');
});
test('ready notification cards do not trigger detail requests', async () => {
  const result = await resolveNotificationCards([{ date: 'Today', items: [{ link: '1', name: 'One', film: card('1') }] }],
    [], async () => { throw new Error('Unnecessary request'); }, () => {});
  assert.equal(result[0].items.length, 1);
});