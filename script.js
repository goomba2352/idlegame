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
    const buyBiggerClickButton = document.getElementById('buyBiggerClick');
    const biggerClickLevelDisplay = document.getElementById('biggerClickLevel');
    const biggerClickCostDisplay = document.getElementById('biggerClickCost');
    const buyMaxChargeButton = document.getElementById('buyMaxCharge');
    const maxChargeLevelDisplay = document.getElementById('maxChargeLevel');
    const maxChargeCostDisplay = document.getElementById('maxChargeCost');
    const scoreChartCanvas = document.getElementById('scoreChart').getContext('2d');
    const rateChartCanvas = document.getElementById('rateChart').getContext('2d');
    const sourceChartCanvas = document.getElementById('sourceChart').getContext('2d');

    let score = 0;
    let autoClickers = 0;
    let quantumEntanglements = 0;
    let biggerClickLevel = 0;
    let maxChargeLevel = 0;
    let lastUpdateTime = 0;
    let pulseStartTime = 0;

    const animatedTexts = [];
    const bouncingCircles = []; // Array to hold the bouncing circles

    let clickScoreAtLastChartUpdate = 0;
    let autoClickerScoreAtLastChartUpdate = 0;
    let scoreAtLastChartUpdate = 0;
    let totalClickScore = 0;
    let totalAutoClickerScore = 0;

    const mainCircle = {
        x: 200,
        y: 200,
        radius: 50,
        color: 'blue'
    };

    const pulseDuration = 200; // Base pulse duration in milliseconds

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

    function getBiggerClickCost() {
        return Math.ceil(100 * Math.pow(1.5, biggerClickLevel));
    }

    function getMaxChargeCost() {
        return Math.ceil(150 * Math.pow(1.6, maxChargeLevel));
    }

    function draw(scaledRadius) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the main circle
        ctx.beginPath();
        ctx.arc(mainCircle.x, mainCircle.y, scaledRadius, 0, Math.PI * 2);
        ctx.fillStyle = mainCircle.color;
        ctx.fill();

        // Draw bouncing circles
        bouncingCircles.forEach(circle => {
            ctx.beginPath();
            ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
            ctx.fillStyle = circle.charge > 0 ? circle.color : 'gray';
            ctx.fill();

            if (circle.charge > 1) {
                ctx.font = '12px sans-serif';
                ctx.fillStyle = 'white';
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 2;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.strokeText(circle.charge, circle.x, circle.y);
                ctx.fillText(circle.charge, circle.x, circle.y);
            }
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

        // Calculate button scaling
        const biggerClickAmount = 0.2 + (biggerClickLevel * 0.05);
        let scale = 1;
        if (pulseStartTime > 0) {
            const elapsedTime = now - pulseStartTime;
            if (elapsedTime < pulseDuration) {
                const pulseProgress = elapsedTime / pulseDuration;
                if (pulseProgress < 0.5) {
                    scale = 1 + biggerClickAmount * (pulseProgress * 2);
                } else {
                    scale = (1 + biggerClickAmount) - biggerClickAmount * ((pulseProgress - 0.5) * 2);
                }
            } else {
                pulseStartTime = 0; // End pulse
            }
        }

        const scaledRadius = mainCircle.radius * scale;

        bouncingCircles.forEach(circle => {
            // Move the circle
            circle.x += circle.dx * deltaSeconds;
            circle.y += circle.dy * deltaSeconds;

            // Wall collision
            if (circle.x - circle.radius <= 0 || circle.x + circle.radius >= canvas.width) {
                circle.dx = -circle.dx;
                if (circle.x - circle.radius <= 0) circle.x = circle.radius;
                if (circle.x + circle.radius >= canvas.width) circle.x = canvas.width - circle.radius;
                if (circle.charge < 1 + maxChargeLevel) {
                    circle.charge++;
                }
            }
            if (circle.y - circle.radius <= 0 || circle.y + circle.radius >= canvas.height) {
                circle.dy = -circle.dy;
                if (circle.y - circle.radius <= 0) circle.y = circle.radius;
                if (circle.y + circle.radius >= canvas.height) circle.y = canvas.height - circle.radius;
                if (circle.charge < 1 + maxChargeLevel) {
                    circle.charge++;
                }
            }

            // Main circle collision
            const dist = Math.hypot(circle.x - mainCircle.x, circle.y - mainCircle.y);
            if (
                now - circle.lastHitTime > 500 && // Cooldown of 500ms
                dist < circle.radius + scaledRadius
            ) {
                circle.lastHitTime = now;

                if (circle.charge > 0) {
                    const autoClickValue = circle.charge;
                    score += autoClickValue;
                    totalAutoClickerScore += autoClickValue;
                    circle.charge = 0;
                }

                // Bounce off the main circle
                const angle = Math.atan2(circle.y - mainCircle.y, circle.x - mainCircle.x);
                const speed = Math.hypot(circle.dx, circle.dy);
                circle.dx = Math.cos(angle) * speed;
                circle.dy = Math.sin(angle) * speed;
            }
        });

        scoreDisplay.textContent = `Score: ${score.toFixed(1)}`;

        draw(scaledRadius);
        requestAnimationFrame(update);
    }

    function handleClick(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const dist = Math.hypot(mouseX - mainCircle.x, mouseY - mainCircle.y);

        if (dist < mainCircle.radius) {
            const clickValue = (1 + quantumEntanglements);
            score += clickValue;
            totalClickScore += clickValue;

            const now = performance.now();
            const elapsedTime = now - pulseStartTime;

            if (pulseStartTime > 0 && elapsedTime < pulseDuration) {
                const pulseProgress = elapsedTime / pulseDuration;
                if (pulseProgress >= 0.5) { // If shrinking, reverse the animation
                    const newElapsedTime = pulseDuration - elapsedTime;
                    pulseStartTime = now - newElapsedTime;
                }
            } else {
                pulseStartTime = now; // Start a new animation
            }

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

    function createBouncingCircle() {
        const radius = 10;
        let x, y;

        // Ensure they don't spawn inside the main circle
        do {
            x = Math.random() * (canvas.width - radius * 2) + radius;
            y = Math.random() * (canvas.height - radius * 2) + radius;
        } while (Math.hypot(x - mainCircle.x, y - mainCircle.y) < mainCircle.radius + radius);

        const speed = 100; // pixels per second
        const angle = Math.random() * 2 * Math.PI;

        bouncingCircles.push({
            x: x,
            y: y,
            radius: radius,
            dx: Math.cos(angle) * speed,
            dy: Math.sin(angle) * speed,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            lastHitTime: 0,
            charge: 0
        });
    }

    function buyAutoClicker() {
        const cost = getAutoClickerCost();
        if (score >= cost) {
            score -= cost;
            autoClickers++;
            autoClickerCountDisplay.textContent = autoClickers;
            autoClickerCostDisplay.textContent = getAutoClickerCost();
            createBouncingCircle();
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

    function buyBiggerClick() {
        const cost = getBiggerClickCost();
        if (score >= cost) {
            score -= cost;
            biggerClickLevel++;
            biggerClickLevelDisplay.textContent = biggerClickLevel;
            biggerClickCostDisplay.textContent = getBiggerClickCost();
        }
    }

    function buyMaxCharge() {
        const cost = getMaxChargeCost();
        if (score >= cost) {
            score -= cost;
            maxChargeLevel++;
            maxChargeLevelDisplay.textContent = maxChargeLevel;
            maxChargeCostDisplay.textContent = getMaxChargeCost();
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

    window.rosebud = function() {
        score += 100000;
    }

    canvas.addEventListener('click', handleClick);
    buyAutoClickerButton.addEventListener('click', buyAutoClicker);
    buyQuantumEntanglementButton.addEventListener('click', buyQuantumEntanglement);
    buyBiggerClickButton.addEventListener('click', buyBiggerClick);
    buyMaxChargeButton.addEventListener('click', buyMaxCharge);

    setInterval(updateCharts, 1000);

    requestAnimationFrame(update);
};
