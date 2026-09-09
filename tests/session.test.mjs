import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';

async function load() {
  const state={mode:'test',stageNumber:1,challengeDeadline:null};
  let now=100;
  const context=vm.createContext({performance:{now:()=>now}});
  const stateModule=new vm.SyntheticModule(['state'], function(){this.setExport('state',state);},{context});
  const mod=new vm.SourceTextModule(await readFile(new URL('../js/utils/session.js',import.meta.url),'utf8'),{context});
  await mod.link(()=>stateModule); await mod.evaluate();
  return {api:mod.namespace,state,setNow:value=>{now=value;}};
}
test('each submitted question is accepted exactly once, including stale controls',async()=>{
  const {api,state}=await load();
  api.beginSession();
  const accept=api.createSubmissionGuard();
  assert.equal(accept(),true);assert.equal(accept(),false);
  const old=api.createSubmissionGuard();state.stageNumber++;
  assert.equal(old(),false);
  assert.equal(api.createSubmissionGuard()(),true);
});
test('navigation invalidates controls immediately and completion is idempotent',async()=>{
  const {api}=await load();
  const old=api.createSubmissionGuard(); api.beginSession();
  assert.equal(old(),false);
  const fresh=api.createSubmissionGuard();
  assert.equal(api.finishSession(),true);assert.equal(api.finishSession(),false);
  assert.equal(fresh(),false);
});
test('deadline rejects late answers and follows elapsed time rather than ticks',async()=>{
  const {api,state,setNow}=await load();api.beginSession();
  state.mode='challenge';state.challengeDeadline=180100;
  const accept=api.createSubmissionGuard();
  assert.equal(api.remainingSeconds(180100,100),180);
  assert.equal(api.remainingSeconds(180100,150500),30);
  assert.equal(api.remainingSeconds(180100,180100),0);
  assert.equal(api.remainingSeconds(180100,900000),0);
  setNow(180100);assert.equal(accept(),false);
});
