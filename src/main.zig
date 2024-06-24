const std = @import("std");
const jsc = @import("zig-jsc");

const fsdir = std.fs.cwd();

fn console_log(
    ctx: jsc.JSContextRef,
    function: jsc.JSObjectRef,
    this: jsc.JSObjectRef,
    argument_count: usize,
    args: [*c]const jsc.JSValueRef,
    except: [*c]jsc.JSValueRef,
) callconv(.C) jsc.JSValueRef {
    _ = except; // autofix
    _ = argument_count; // autofix
    _ = this; // autofix
    _ = function; // autofix
    const a = jsc.valueToString(ctx, args[0]) catch |err| {
        std.debug.print("> js err {}", .{err});
    };

    std.debug.print("> js log {}", .{a});
    return jsc.createUndefined(ctx);
}

fn render_app(
    ctx: jsc.JSContextRef,
    function: jsc.JSObjectRef,
    this: jsc.JSObjectRef,
    argument_count: usize,
    args: [*c]const jsc.JSValueRef,
    except: [*c]jsc.JSValueRef,
) callconv(.C) jsc.JSValueRef {
    _ = args; // autofix
    _ = except; // autofix
    _ = argument_count; // autofix
    _ = this; // autofix
    _ = function; // autofix
    std.debug.print("> rs render_app", .{});
    return jsc.createUndefined(ctx);
}

pub fn main() !void {
    const global_source = jsc.createString("const process = { env: { NODE_ENV: 'production' }}");

    const app_name = "../dist/main.js";
    const app = try fsdir.openFile(app_name, .{});
    defer app.close();

    const file_size = try app.getEndPos();

    const allocator = std.heap.page_allocator;
    const buffer: [*c]u8 = @alignCast(try fsdir.readFileAlloc(allocator, app_name, std.math.maxInt(usize)));
    defer allocator.free(buffer);

    const app_source = jsc.createString("");
    _ = jsc.createStringWithBuffer(app_source, buffer, file_size);

    const context = jsc.createContext();
    const global = jsc.getGlobalObject(context);

    const renderfn_value = jsc.createFunction(context, jsc.createString("render"), render_app);
    const log_value = jsc.createFunction(context, jsc.createString("log"), console_log);
    const error_value = jsc.createFunction(context, jsc.createString("error"), console_log);

    const console = jsc.createObject(context);
    jsc.setProperty(context, console, jsc.createString("log"), log_value);
    jsc.setProperty(context, console, jsc.createString("error"), error_value);

    jsc.setProperty(context, global, jsc.createString("console"), console);
    jsc.setProperty(context, global, jsc.createString("renderApp"), renderfn_value);

    jsc.evaluateScript(context, global_source) catch |err| {
        _ = err; // autofix
        std.debug.print("Cannot inject global code", .{});
    };

    jsc.evaluateScript(context, app_source) catch |err| {
        _ = err; // autofix
        std.debug.print("> js Uncaught: {}", .{});
    };
}
