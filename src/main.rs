use std::ptr;

use mozjs::jsapi::*;
use mozjs::jsval::UndefinedValue;
use mozjs::rooted;
use mozjs::rust::{JSEngine, RealmOptions, Runtime};

fn main() {
    let engine = JSEngine::init().expect("failed to initalize JS engine");
    let runtime = Runtime::new(engine.handle());
    assert!(!runtime.cx().is_null(), "failed to create JSContext");

    let options = RealmOptions::default();
    rooted!(in(rt.cx()) let global = unsafe {
        JS_NewGlobalObject(rt.cx(), &SIMPLE_GLOBAL_CLASS, ptr::null_mut(), OnNewGlobalHookOption::FireOnNewGlobalHook, &*options)
    });

    // runtime.evaluate_script(glob, script, filename, line_num, rval)
}
