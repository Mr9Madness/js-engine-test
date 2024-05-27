use std::fs;

use mobile_entry_point::mobile_entry_point;
use winit::{
    event::{Event, WindowEvent},
    event_loop::{ControlFlow, EventLoop},
    window::WindowBuilder,
};
use rusty_jsc::JSContext;

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

#[mobile_entry_point]
fn main() {
    init_logging();
    let event_loop = EventLoop::new();

    let window = WindowBuilder::new()
        .with_title("A fantastic window!")
        .with_inner_size(winit::dpi::LogicalSize::new(128.0, 128.0))
        .build(&event_loop)
        .unwrap();

    let mut context = JSContext::default();
    let a = fs::read_to_string("./dist/main.js").expect("Cannot read file");

    event_loop.run(move |event, _, control_flow| {
        *control_flow = ControlFlow::Wait;

        match context.evaluate_script(&a, 1) {
            Ok(value) => {
                println!("{}", value.to_string(&context).unwrap());
            },
            Err(e) => {
                println!("JS Uncaught: {}", e.to_string(&context).unwrap())
            },
        }

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
