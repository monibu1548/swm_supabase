Deno.serve(() => {
  return new Response(`Hello World!`, {
    headers: { "Content-Type": "application/json" },
  });
});
