<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Telegram Bot Controller</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
</head>
<body>
    <h1>Telegram Bot Controller</h1>
    <input type="text" id="urlInput" placeholder="Enter URL to request">
    <button onclick="startBot()">Start Bot</button>
    <button onclick="stopBot()">Stop Bot</button>
    <p id="status"></p>

    <script>
        async function startBot() {
            const url = document.getElementById('urlInput').value;
            try {
                const response = await axios.post('/start', { url });
                document.getElementById('status').textContent = response.data.status;
            } catch (error) {
                document.getElementById('status').textContent = `Error: ${error.response.data.error}`;
            }
        }

        async function stopBot() {
            try {
                const response = await axios.post('/stop');
                document.getElementById('status').textContent = response.data.status;
            } catch (error) {
                document.getElementById('status').textContent = `Error: ${error.response.data.error}`;
            }
        }
    </script>
</body>
</html>
