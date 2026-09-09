import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';

test('the deployed Sortable version still supports mouse drag and destroys its instance on navigation',async({page})=>{
  const sortable=await readFile(new URL('../node_modules/sortablejs/Sortable.min.js',import.meta.url));
  await page.route('https://**/*',route=>route.fulfill({status:200,body:route.request().url().includes('sortablejs@1.15.6')?sortable:Buffer.from('')}));
  await page.goto('/MY-ColorVision/');
  await page.waitForFunction(()=>window.appLoaded && typeof window.Sortable==='function');
  await page.evaluate(()=>window.setMode('test'));
  await expect(page.locator('#start-btn')).toBeVisible();
  await page.evaluate(async()=>{
    const {state}=await import('/MY-ColorVision/js/state.js');
    state.stageNumber=4;state.tutorialShown[4]=true;
    (await import('/MY-ColorVision/app.js')).renderNextStage();
  });
  const cubes=page.locator('#sort-box .color-cube');
  await expect(cubes).toHaveCount(5);
  const before=await cubes.evaluateAll(nodes=>nodes.map(n=>n.dataset.hue));
  const first=await cubes.first().boundingBox();
  await page.evaluate(()=>{
    document.getElementById('sort-box').addEventListener('end',event=>{
      window.completedDrag={oldIndex:event.oldIndex,newIndex:event.newIndex};
    });
  });
  await page.mouse.move(first.x+first.width/2,first.y+first.height/2);
  await page.mouse.down();
  await page.mouse.move(first.x+first.width/2+10,first.y+first.height/2,{steps:4});
  // Hold the same native drag while crossing each neighbor. Sortable animates
  // the swapped cubes for 200ms; wait for that movement before the next target.
  for(let index=1;index<before.length;index++){
    const next=await page.locator(`.color-cube[data-hue="${before[index]}"]`).boundingBox();
    await page.mouse.move(next.x+next.width-5,next.y+next.height/2,{steps:8});
    await page.mouse.move(next.x+next.width-5,next.y+next.height/2+1);
    await expect.poll(()=>cubes.evaluateAll((nodes,hue)=>nodes.findIndex(node=>node.dataset.hue===hue),before[0])).toBe(index);
    await expect.poll(()=>cubes.evaluateAll(nodes=>nodes.every(node=>!node.animated))).toBe(true);
  }
  await page.mouse.up();
  await expect.poll(()=>cubes.evaluateAll(nodes=>nodes.map(n=>n.dataset.hue))).toEqual([...before.slice(1),before[0]]);
  expect(await page.evaluate(()=>window.completedDrag)).toEqual({oldIndex:0,newIndex:4});
  await expect(cubes.last()).toHaveAttribute('aria-label','5번 칸');
  await page.evaluate(()=>{window.oldSortBox=document.getElementById('sort-box');window.setMode('lab');});
  await expect(page.locator('#upload-area')).toBeVisible();
  expect(await page.evaluate(()=>window.Sortable.get(window.oldSortBox))).toBeNull();
});
