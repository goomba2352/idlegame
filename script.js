window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const buyAutoClickerButton = document.getElementById('buyAutoClicker');
    const autoClickerCountDisplay = document.getElementById('autoClickerCount');
    const autoClickerCostDisplay = document.getElementById('autoClickerCost');
    const buyQuantumEntanglementButton = document.getElementById('buyQuantumEntanglement');
    const quantumEntanglementCountDisplay = document.getElementById('quantumEntanglementCount');
    const quantumEntanglementCostDisplay = document.getElementById('quantumEntanglementCost');
    const scoreChartCanvas = document.getElementById('scoreChart').getContext('2d');
    const rateChartCanvas = document.getElementById('rateChart').getContext('2d');
    const sourceChartCanvas = document.getElementById('sourceChart').getContext('2d');

    let score = 0;
    let autoClickers = 0;
    let quantumEntanglements = 0;
    let lastUpdateTime = 0;
    let pulseStartTime = 0;
    const pulseDuration = 200; // Pulse duration in milliseconds

    const animatedTexts = [];
    const bouncingBoxes = []; // Array to hold the bouncing boxes

    let clickScoreAtLastChartUpdate = 0;
    let autoClickerScoreAtLastChartUpdate = 0;
    let scoreAtLastChartUpdate = 0;
    let totalClickScore = 0;
    let totalAutoClickerScore = 0;

    const button = {
        x: 150,
        y: 150,
        width: 100,
        height: 100,
        color: 'blue'
    };

    const scoreChart = new Chart(scoreChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Score',
                data: [],
                borderColor: 'blue',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            }, {
                label: 'Score from Clicks',
                data: [],
                borderColor: 'red',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }, {
                label: 'Score from Auto-Clickers',
                data: [],
                borderColor: 'purple',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            animation: false,
            scales: {
                x: {
                    type: 'category',
                    position: 'bottom'
                }
            }
        }
    });

    const rateChart = new Chart(rateChartCanvas, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Increase Rate',
                data: [],
                borderColor: 'green',
                borderWidth: 2,
                fill: false,
                pointRadius: 0
            }, {
                label: 'Click Rate',
                data: [],
                borderColor: 'red',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }, {
                label: 'Auto-Clicker Rate',
                data: [],
                borderColor: 'purple',
                borderWidth: 1,
                fill: false,
                pointRadius: 0
            }]
        },
        options: {
            animation: false,
            scales: {
                x: {
                    type: 'category',
                    position: 'bottom'
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const sourceChart = new Chart(sourceChartCanvas, {
        type: 'bar',
        data: {
            labels: ['Clicks', 'Auto-Clickers'],
            datasets: [{
                label: 'Score Source (Total)',
                data: [0, 0],
                backgroundColor: ['red', 'blue'],
                borderWidth: 1
            }]
        },
        options: {
            animation: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    function getAutoClickerCost() {
        return Math.ceil(10 * Math.pow(1.1, autoClickers));
    }

    function getQuantumEntanglementCost() {
        return 500 + (quantumEntanglements * 100);
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        let scale = 1;
        if (pulseStartTime > 0) {
            const elapsedTime = performance.now() - pulseStartTime;
            if (elapsedTime < pulseDuration) {
                const pulseProgress = elapsedTime / pulseDuration;
                if (pulseProgress < 0.5) {
                    scale = 1 + 0.2 * (pulseProgress * 2);
                } else {
                    scale = 1.2 - 0.2 * ((pulseProgress - 0.5) * 2);
                }
            } else {
                pulseStartTime = 0; // End pulse
            }
        }

        const scaledWidth = button.width * scale;
        const scaledHeight = button.height * scale;
        const x = button.x - (scaledWidth - button.width) / 2;
        const y = button.y - (scaledHeight - button.height) / 2;

        ctx.fillStyle = button.color;
        ctx.fillRect(x, y, scaledWidth, scaledHeight);

        // Draw bouncing boxes
        bouncingBoxes.forEach(box => {
            ctx.fillStyle = box.color;
            ctx.fillRect(box.x, box.y, box.width, box.height);
        });

        // Draw animated texts
        const currentTime = performance.now();
        for (let i = animatedTexts.length - 1; i >= 0; i--) {
            const anim = animatedTexts[i];
            const elapsedTime = currentTime - anim.startTime;

            if (elapsedTime >= anim.duration) {
                animatedTexts.splice(i, 1);
                continue;
            }

            const fade = 1 - (elapsedTime / anim.duration);
            const yOffset = -20 * (elapsedTime / anim.duration);

            ctx.font = '30px sans-serif';
            ctx.fillStyle = `rgba(255, 255, 255, ${fade})`;
            ctx.strokeStyle = `rgba(0, 0, 0, ${fade})`;
            ctx.lineWidth = 2;
            ctx.strokeText(anim.text, anim.x, anim.y + yOffset);
            ctx.fillText(anim.text, anim.x, anim.y + yOffset);
        }
    }

    function update(timestamp) {
        if (!lastUpdateTime) {
            lastUpdateTime = timestamp;
        }
        const deltaTime = timestamp - lastUpdateTime;
        lastUpdateTime = timestamp;

        const now = performance.now();
        const deltaSeconds = deltaTime / 1000;

        bouncingBoxes.forEach(box => {
            // Move the box
            box.x += box.dx * deltaSeconds;
            box.y += box.dy * deltaSeconds;

            // Wall collision
            if (box.x <= 0 || box.x + box.width >= canvas.width) {
                box.dx = -box.dx;
                if (box.x <= 0) box.x = 0;
                if (box.x + box.width >= canvas.width) box.x = canvas.width - box.width;
            }
            if (box.y <= 0 || box.y + box.height >= canvas.height) {
                box.dy = -box.dy;
                if (box.y <= 0) box.y = 0;
                if (box.y + box.height >= canvas.height) box.y = canvas.height - box.height;
            }

            // Main button collision
            if (
                now - box.lastHitTime > 500 && // Cooldown of 500ms
                box.x < button.x + button.width &&
                box.x + box.width > button.x &&
                box.y < button.y + button.height &&
                box.y + box.height > button.y
            ) {
                box.lastHitTime = now;
                const autoClickValue = 1; // Each hit is worth 1 point
                score += autoClickValue;
                totalAutoClickerScore += autoClickValue;

                // Bounce off the main button
                const overlapX = (box.x + box.width / 2) - (button.x + button.width / 2);
                const overlapY = (box.y + box.height / 2) - (button.y + button.height / 2);
                const combinedHalfWidths = (box.width + button.width) / 2;
                const combinedHalfHeights = (box.height + button.height) / 2;

                if (Math.abs(overlapX) / combinedHalfWidths > Math.abs(overlapY) / combinedHalfHeights) {
                    box.dx = -box.dx;
                    box.x += (overlapX > 0 ? 1 : -1);
                } else {
                    box.dy = -box.dy;
                    box.y += (overlapY > 0 ? 1 : -1);
                }
            }
        });

        scoreDisplay.textContent = `Score: ${score.toFixed(1)}`;

        draw();
        requestAnimationFrame(update);
    }

    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        if (
            mouseX >= button.x &&
            mouseX <= button.x + button.width &&
            mouseY >= button.y &&
            mouseY <= button.y + button.height
        ) {
            const clickValue = (1 + quantumEntanglements);
            score += clickValue;
            totalClickScore += clickValue;
            pulseStartTime = performance.now();

            // Add animated text
            const xOffset = (Math.random() - 0.5) * 20; // -10 to 10
            const yOffset = (Math.random() - 0.5) * 20; // -10 to 10
            animatedTexts.push({
                text: `+${clickValue.toFixed(0)}`,
                x: mouseX + xOffset,
                y: mouseY + yOffset,
                startTime: performance.now(),
                duration: 1000 // 1 second
            });
        }
    }

    function createBouncingBox() {
        const boxSize = 20;
        let x = Math.random() * (canvas.width - boxSize);
        let y = Math.random() * (canvas.height - boxSize);

        // Ensure they don't spawn inside the main button
        while (
            x < button.x + button.width &&
            x + boxSize > button.x &&
            y < button.y + button.height &&
            y + boxSize > button.y
        ) {
            x = Math.random() * (canvas.width - boxSize);
            y = Math.random() * (canvas.height - boxSize);
        }

        const speed = 100; // pixels per second
        const angle = Math.random() * 2 * Math.PI;

        bouncingBoxes.push({
            x: x,
            y: y,
            width: boxSize,
            height: boxSize,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            lastHitTime: 0
        });
    }

    function buyAutoClicker() {
        const cost = getAutoClickerCost();
        if (score >= cost) {
            score -= cost;
            autoClickers++;
            autoClickerCountDisplay.textContent = autoClickers;
            autoClickerCostDisplay.textContent = getAutoClickerCost();
            createBouncingBox();
        }
    }

    function buyQuantumEntanglement() {
        const cost = getQuantumEntanglementCost();
        if (score >= cost) {
            score -= cost;
            quantumEntanglements++;
            quantumEntanglementCountDisplay.textContent = quantumEntanglements;
            quantumEntanglementCostDisplay.textContent = getQuantumEntanglementCost();
        }
    }

    function updateCharts() {
        const currentTime = Math.floor(performance.now() / 1000);

        // Score over time chart
        scoreChart.data.labels.push(currentTime);
        scoreChart.data.datasets[0].data.push(score);
        scoreChart.data.datasets[1].data.push(totalClickScore);
        scoreChart.data.datasets[2].data.push(totalAutoClickerScore);
        scoreChart.update();

        // Rate of increase chart
        const clickIncrease = totalClickScore - clickScoreAtLastChartUpdate;
        const autoClickerIncrease = totalAutoClickerScore - autoClickerScoreAtLastChartUpdate;
        const scoreIncrease = (score - scoreAtLastChartUpdate); // Total score increase
        scoreAtLastChartUpdate = score;
        clickScoreAtLastChartUpdate = totalClickScore;
        autoClickerScoreAtLastChartUpdate = totalAutoClickerScore;

        rateChart.data.labels.push(currentTime);
        rateChart.data.datasets[0].data.push(scoreIncrease);
        rateChart.data.datasets[1].data.push(clickIncrease);
        rateChart.data.datasets[2].data.push(autoClickerIncrease);
        rateChart.update();

        // Score source chart
        sourceChart.data.datasets[0].data[0] = totalClickScore;
        sourceChart.data.datasets[0].data[1] = totalAutoClickerScore;
        sourceChart.update();
    }

    canvas.addEventListener('click', handleClick);
    buyAutoClickerButton.addEventListener('click', buyAutoClicker);
    buyQuantumEntanglementButton.addEventListener('click', buyQuantumEntanglement);

    setInterval(updateCharts, 1000);

    requestAnimationFrame(update);
};
