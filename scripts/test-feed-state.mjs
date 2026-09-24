import assert from 'node:assert/strict';
import {test} from 'node:test';
import {feedPath,tabFromLocation,updateFeedPosts} from '../lib/feed-state.ts';

const posts=[{id:'photo',saved:1,liked:0,like_count:2},{id:'reel',saved:0,liked:1,like_count:3}];
test('direct URLs and back/forward resolve the correct selected tab',()=>{
  assert.equal(tabFromLocation('/saved',''),'saved');
  assert.equal(tabFromLocation('/profile','?tab=reels'),'reels');
  assert.equal(tabFromLocation('/profile','?tab=exclusive'),'exclusive');
  assert.equal(tabFromLocation('/feed',''),'demo');
});
test('collections generate isolated server queries',()=>{
  assert.equal(feedPath('saved'),'/api/app/feed?offset=0&kind=all&saved=1');
  assert.equal(feedPath('demo'),'/api/app/feed?offset=0&kind=all&collection=demo');
  assert.equal(feedPath('exclusive'),'/api/app/feed?offset=0&kind=all&collection=exclusive');
  assert.equal(feedPath('exclusive',0,2),'/api/app/feed?offset=0&kind=all&collection=exclusive&level=2');
  assert.equal(feedPath('reels'),'/api/app/feed?offset=0&kind=video');
  assert.match(feedPath('saved',12),/offset=12/);
});
test('unsaving never removes a post from normal collections',()=>{
  for(const tab of ['demo','exclusive','reels']){
    const next=updateFeedPosts(posts,tab,'photo','save',false);
    assert.equal(next.length,2);assert.equal(next[0].saved,0);
  }
  assert.equal(posts[0].saved,1,'original state stays unchanged');
});
test('unsaving removes just that item from Saved',()=>{
  assert.deepEqual(updateFeedPosts(posts,'saved','photo','save',false).map(p=>p.id),['reel']);
});
test('saving and unsaving can repeat without losing feed items',()=>{
  let next=posts;
  for(const selected of [false,true,false,true])next=updateFeedPosts(next,'demo','photo','save',selected);
  assert.equal(next.length,2);assert.equal(next[0].saved,1);
});
test('like updates do not filter saved posts and do not double-count',()=>{
  const liked=updateFeedPosts(posts,'saved','photo','like',true);
  assert.equal(liked.length,2);assert.equal(liked[0].like_count,3);
  assert.equal(updateFeedPosts(liked,'saved','photo','like',true)[0].like_count,3);
  assert.equal(updateFeedPosts(liked,'saved','photo','like',false)[0].like_count,2);
});
