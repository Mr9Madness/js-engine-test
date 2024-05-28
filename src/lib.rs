use std::fs;

use mobile_entry_point::mobile_entry_point;
use winit::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};
use rusty_jsc::{JSContext, JSValue};
use rusty_jsc_macros::callback;

#[cfg(target_os = "android")]
fn init_logging() {
    android_logger::init_once(
        android_logger::Config::default()
            .with_min_level(log::Level::Trace)
            .with_tag("js-engine-test"),
    );
}

#[cfg(not(target_os = "android"))]
fn init_logging() {
    simple_logger::SimpleLogger::new().init().unwrap();
}

#[callback]
fn clear_timeout(ctx: JSContext, _function: JSObject, _this: JSObject, args: &[JSValue]) {
    println!("clear_timeout");
    Ok(JSValue::string(&ctx, format!("Hello, {}", args[0].to_string(&ctx).unwrap())))
}

#[callback]
fn set_timeout(ctx: JSContext, _function: JSObject,_this: JSObject, args: &[JSValue]) {
    println!("set_timeout");
    Ok(JSValue::string(&ctx, format!("Hello, {}", args[0].to_string(&ctx).unwrap())))
}

#[mobile_entry_point]
fn main() {
    init_logging();
    let event_loop = EventLoop::new();

    let window = WindowBuilder::new()
        .with_title("Vue app")
        .with_inner_size(winit::dpi::LogicalSize::new(512.0, 512.0))
        .build(&event_loop)
        .unwrap();

    let global_source = "const process = { env: { NODE_ENV: 'production' }}";
    let app_source = fs::read_to_string("./dist/main.js").expect("Cannot read file");

    let mut context = JSContext::default();
    let global = context.get_global_object();

    let clear_value = JSValue::callback(&context, Some(clear_timeout));
    let set_value = JSValue::callback(&context, Some(set_timeout));
    
    global.set_property(&context, "clearTimeout", clear_value).unwrap();
    global.set_property(&context, "setTimeout", set_value).unwrap();

    context.evaluate_script(&global_source, 1).expect("Cannot inject global code");

    let _ = context.evaluate_script(&app_source, 1)
        .inspect_err(|e| println!("JS Uncaught: {}", e.to_string(&context).unwrap()));

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match event {
            Event::WindowEvent {
                event: WindowEvent::CloseRequested,
                window_id,
            } if window_id == window.id() => *control_flow = ControlFlow::Exit,
            Event::MainEventsCleared => {
                window.request_redraw();
            }
            _ => (),
        }
    });
}
