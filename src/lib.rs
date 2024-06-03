use std::{fs, thread, time};

use mobile_entry_point::mobile_entry_point;
use winit::{
    application::ApplicationHandler, 
    event::{ElementState, KeyEvent, StartCause, WindowEvent}, 
    event_loop::{ActiveEventLoop, ControlFlow, EventLoop}, 
    keyboard::{Key, NamedKey}, 
    window::{Window, WindowId},
};
use rusty_jsc::{JSContext, JSObject, JSValue};
use rusty_jsc_macros::callback;

const WAIT_TIME: time::Duration = time::Duration::from_millis(100);
const POLL_SLEEP_TIME: time::Duration = time::Duration::from_millis(100);

#[derive(Default, Debug, Clone, Copy, PartialEq, Eq)]
enum Mode {
    #[default]
    Wait,
    WaitUntil,
    Poll,
}

#[derive(Default)]
struct ControlFlowDemo {
    mode: Mode,
    request_redraw: bool,
    wait_cancelled: bool,
    close_requested: bool,
    window: Option<Window>,
}

#[cfg(target_os = "android")]
fn init_logging() {
    android_logger::init_once(
        android_logger::Config::default()
            .with_min_level(log::Level::Trace)
            .with_tag("js-engine-test"),
    );
}

// #[cfg(not(target_os = "android"))]
// fn init_logging() {
//     simple_logger::SimpleLogger::new().init().unwrap();
// }

#[callback]
fn clear_timeout(ctx: JSContext, _function: JSObject, _this: JSObject, args: &[JSValue]) {
    println!("> rs clear_timeout");
    Ok(JSValue::string(&ctx, format!("Hello, {}", args[0].to_string(&ctx).unwrap())))
}

#[callback]
fn set_timeout(ctx: JSContext, _function: JSObject,_this: JSObject, args: &[JSValue]) {
    println!("> rs set_timeout");
    Ok(JSValue::string(&ctx, format!("Hello, {}", args[0].to_string(&ctx).unwrap())))
}

#[callback]
fn console(ctx: JSContext, _function: JSObject,_this: JSObject, args: &[JSValue]) {
    args[0].to_string(&ctx)
        .inspect(|x| println!("> js log {}", x.to_string()))
        .inspect_err(|e| println!("> js err {}", e.to_string(&ctx).unwrap())).unwrap().to_string();

    Ok(JSValue::undefined(&ctx))
}

#[callback]
fn render_app(ctx: JSContext, _function: JSObject, _this: JSObject, args: &[JSValue]) {
    println!("> rs render_app");

    Ok(JSValue::undefined(&ctx))
}

#[mobile_entry_point]
fn main() {
    // init_logging();
    let event_loop = EventLoop::new().unwrap();

    let global_source = "const process = { env: { NODE_ENV: 'production' }}";
    let app_source = fs::read_to_string("./dist/main.js").expect("Cannot read file");

    let mut context = JSContext::new();
    let global = context.get_global_object();

    let clear_value = JSValue::callback(&context, Some(clear_timeout));
    let set_value = JSValue::callback(&context, Some(set_timeout));
    let renderfn_value = JSValue::callback(&context, Some(render_app));
    let log_value = JSValue::callback(&context, Some(console));
    let error_value = JSValue::callback(&context, Some(console));
    
    let console = JSObject::new(&context);
    console.set_property(&context, "log", log_value).unwrap();
    console.set_property(&context, "error", error_value).unwrap();

    global.set_property(&context, "console", console.to_jsvalue()).unwrap();
    global.set_property(&context, "clearTimeout", clear_value).unwrap();
    global.set_property(&context, "setTimeout", set_value).unwrap();
    global.set_property(&context, "renderApp", renderfn_value).unwrap();

    context.evaluate_script(&global_source, 1).expect("Cannot inject global code");

    let _ = context.evaluate_script(&app_source, 1)
        .inspect_err(|e| println!("> js Uncaught: {}", e.to_string(&context).unwrap()));

    let mut app = ControlFlowDemo::default();
    _ = event_loop.run_app(&mut app)
        .inspect_err(|f| println!("> rs err: {}", f.to_string()))
}

impl ApplicationHandler for ControlFlowDemo {
    fn new_events(&mut self, _event_loop: &ActiveEventLoop, cause: StartCause) {
        // println!("new_events: {cause:?}");

        self.wait_cancelled = match cause {
            StartCause::WaitCancelled { .. } => self.mode == Mode::WaitUntil,
            _ => false,
        }
    }

    fn resumed(&mut self, event_loop: &ActiveEventLoop) {
        let window_attributes = Window::default_attributes().with_title(
            "Press 1, 2, 3 to change control flow mode. Press R to toggle redraw requests.",
        );
        self.window = Some(event_loop.create_window(window_attributes).unwrap());
    }

    fn window_event(
        &mut self,
        _event_loop: &ActiveEventLoop,
        _window_id: WindowId,
        event: WindowEvent,
    ) {
        // println!("{event:?}");

        match event {
            WindowEvent::CloseRequested => {
                self.close_requested = true;
            },
            WindowEvent::KeyboardInput {
                event: KeyEvent { logical_key: key, state: ElementState::Pressed, .. },
                ..
            } => match key.as_ref() {
                // WARNING: Consider using `key_without_modifiers()` if available on your platform.
                // See the `key_binding` example
                Key::Character("1") => {
                    self.mode = Mode::Wait;
                    println!("mode: {:?}", self.mode);
                },
                Key::Character("2") => {
                    self.mode = Mode::WaitUntil;
                    println!("mode: {:?}", self.mode);
                },
                Key::Character("3") => {
                    self.mode = Mode::Poll;
                    println!("mode: {:?}", self.mode);
                },
                Key::Character("r") => {
                    self.request_redraw = !self.request_redraw;
                    println!("request_redraw: {}", self.request_redraw);
                },
                Key::Named(NamedKey::Escape) => {
                    self.close_requested = true;
                },
                _ => (),
            },
            WindowEvent::RedrawRequested => {
                let window = self.window.as_ref().unwrap();
                window.pre_present_notify();
                // fill::fill_window(window);
            },
            _ => (),
        }
    }

    fn about_to_wait(&mut self, event_loop: &ActiveEventLoop) {
        if self.request_redraw && !self.wait_cancelled && !self.close_requested {
            self.window.as_ref().unwrap().request_redraw();
        }

        match self.mode {
            Mode::Wait => event_loop.set_control_flow(ControlFlow::Wait),
            Mode::WaitUntil => {
                if !self.wait_cancelled {
                    event_loop
                        .set_control_flow(ControlFlow::WaitUntil(time::Instant::now() + WAIT_TIME));
                }
            },
            Mode::Poll => {
                thread::sleep(POLL_SLEEP_TIME);
                event_loop.set_control_flow(ControlFlow::Poll);
            },
        };

        if self.close_requested {
            event_loop.exit();
        }
    }
}