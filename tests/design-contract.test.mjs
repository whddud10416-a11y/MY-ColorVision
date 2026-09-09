import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
const ref='ecd82e63eb51b5ad8ec34eb3548a7c2b0c3d41bb';
const original=file=>execFileSync('git',['show',ref+':'+file],{encoding:'utf8'});
const current=file=>readFileSync(file,'utf8');
const classes=source=>[...source.matchAll(/class="([^"]*)"/g)].map(match=>match[1]).sort();
test('the original visual stylesheet is unchanged; additions are keyboard/reduced-motion only',()=>{
  const old=original('style.css').trimEnd();
  const next=current('style.css');
  assert.ok(next.startsWith(old),'Do not edit the original visual rules');
  const addition=next.slice(old.length);
  assert.ok(addition.includes('[role="button"]:focus-visible'));
  assert.ok(addition.includes('@media (prefers-reduced-motion: reduce)'));
});
test('document and Lab template class lists remain identical to the original design',()=>{
  for(const file of ['index.html','js/stages/colorLab.js','js/stages/colorLabDesktop.js','js/stages/colorLabMobile.js'])
    assert.deepEqual(classes(current(file)),classes(original(file)),file);
});
test('original image stimuli, palette data and layout entry points remain intact',()=>{
  const files=execFileSync('git',['ls-tree','-r','--name-only',ref,'images'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
  for(const file of files) assert.deepEqual(readFileSync(file),execFileSync('git',['show',ref+':'+file],{maxBuffer:32*1024*1024}),file);
  for(const file of ['js/data.js','js/data/cvdData.js','js/stages/homeMobile.js','js/stages/homeUI.js','js/utils/device.js'])
    assert.equal(current(file),original(file),file);
  assert.equal(JSON.parse(current('package.json')).type,'commonjs');
});
