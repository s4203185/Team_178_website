export async function runQuery(sql) {
  const response = await fetch("/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sql })
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error || "SQL query failed");
  }
  return payload.rows || [];
}
