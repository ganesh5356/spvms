export async function downloadWithAuth({ url, filename, token }) {
  console.log("📥 Download clicked");
  console.log("➡️ URL:", url);
  console.log("🔐 Token:", token);

  try {
    if (!token) {
      alert("Token missing");
      return;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("✅ Response received:", response);

    if (!response.ok) {
      console.error("❌ Response not OK:", response.status);
      const text = await response.text();
      console.error("❌ Error body:", text);
      alert(`Download failed: ${response.status}`);
      return;
    }

    console.log("📦 Reading blob...");
    const blob = await response.blob();
    console.log("📦 Blob size:", blob.size);

    const objectUrl = window.URL.createObjectURL(blob);
    console.log("🔗 Object URL:", objectUrl);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(objectUrl);

    console.log("✅ Download triggered");

  } catch (err) {
    console.error("🔥 CATCH ERROR:", err);
    alert("Unexpected error during download");
  }
}
