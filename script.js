window.onload = function() {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const buyBouncyBallButton = document.getElementById('buyBouncyBall');
    const bouncyBallCountDisplay = document.getElementById('bouncyBallCount');
    const bouncyBallCostDisplay = document.getElementById('bouncyBallCost');
    const buyQuantumEntanglementButton = document.getElementById('buyQuantumEntanglement');
    const quantumEntanglementCountDisplay = document.getElementById('quantumEntanglementCount');
    const quantumEntanglementCostDisplay = document.getElementById('quantumEntanglementCost');
    const buyBiggerClickButton = document.getElementById('buyBiggerClick');
    const biggerClickLevelDisplay = document.getElementById('biggerClickLevel');
    const biggerClickCostDisplay = document.getElementById('biggerClickCost');
    const buyMaxChargeButton = document.getElementById('buyMaxCharge');
    const maxChargeLevelDisplay = document.getElementById('maxChargeLevel');
    const maxChargeCostDisplay = document.getElementById('maxChargeCost');
    const buyReduceFrictionButton = document.getElementById('buyReduceFriction');
    const reduceFrictionLevelDisplay = document.getElementById('reduceFrictionLevel');
    const reduceFrictionCostDisplay = document.getElementById('reduceFrictionCost');
    const buyBouncyBallSpeedButton = document.getElementById('buyBouncyBallSpeed');
    const bouncyBallSpeedLevelDisplay = document.getElementById('bouncyBallSpeedLevel');
    const bouncyBallSpeedCostDisplay = document.getElementById('bouncyBallSpeedCost');
    const scoreChartCanvas = document.getElementById('scoreChart').getContext('2d');
    const rateChartCanvas = document.getElementById('rateChart').getContext('2d');
    const sourceChartCanvas = document.getElementById('sourceChart').getContext('2d');

    let score = 0;
    let bouncyBalls = 0;
    let quantumEntanglements = 0;
    let biggerClickLevel = 0;
    let maxChargeLevel = 0;
    let reduceFrictionLevel = 0;
    let bouncyBallSpeedLevel = 0;
    let lastUpdateTime = 0;
    let pulseStartTime = 0;

    const animatedTexts = [];
    const bouncingCircles = []; // Array to hold the bouncing circles
    let draggedCircle = null;
    let mouse = { x: 0, y: 0 };

    let clickScoreAtLastChartUpdate = 0;
    let bouncyBallScoreAtLastChartUpdate = 0;
    let scoreAtLastChartUpdate = 0;
    let totalClickScore = 0;
    let totalBouncyBallScore = 0;

    const mainCircle = {
        x: 200,
        y: 200,
        radius: 50,
        color: 'blue'
    };

    const pulseDuration = 200; // Base pulse duration in milliseconds
    const baseSpeed = 100;

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
                label: 'Score from Bouncy-Balls',
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
                label: 'Bouncy-Ball Rate',
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

    function getBouncyBallCost() {
        return Math.ceil(10 * Math.pow(1.1, bouncyBalls));
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

    function getReduceFrictionCost() {
        return Math.ceil(200 * Math.pow(1.7, reduceFrictionLevel));
    }

    function getBouncyBallSpeedCost() {
        return Math.ceil(1000 * Math.pow(2, bouncyBallSpeedLevel));
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

        // Draw aiming line
        if (draggedCircle) {
            ctx.beginPath();
            ctx.moveTo(draggedCircle.x, draggedCircle.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.stroke();
        }

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
        let isPulsing = false;
        if (pulseStartTime > 0) {
            const elapsedTime = now - pulseStartTime;
            if (elapsedTime < pulseDuration) {
                isPulsing = true;
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
        const friction = 0.1 * Math.pow(0.9, reduceFrictionLevel);
        const bouncyBallSpeed = baseSpeed * Math.pow(1.2, bouncyBallSpeedLevel);

        bouncingCircles.forEach(circle => {
            if (circle.isBeingDragged) return;

            // Apply friction
            const speed = Math.hypot(circle.dx, circle.dy);
            if (speed > bouncyBallSpeed) {
                const newSpeed = speed * (1 - friction * deltaSeconds);
                circle.dx *= (newSpeed / speed);
                circle.dy *= (newSpeed / speed);
            }

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

                if (isPulsing) {
                    const angle = Math.atan2(circle.y - mainCircle.y, circle.x - mainCircle.x);
                    const impactSpeed = 200; // Speed boost
                    circle.dx = Math.cos(angle) * impactSpeed;
                    circle.dy = Math.sin(angle) * impactSpeed;
                }

                if (circle.charge > 0) {
                    const autoClickValue = circle.charge;
                    score += autoClickValue;
                    totalBouncyBallScore += autoClickValue;
                    circle.charge = 0;
                }

                // Bounce off the main circle
                const angle = Math.atan2(circle.y - mainCircle.y, circle.x - mainCircle.x);
                const currentSpeed = Math.hypot(circle.dx, circle.dy);
                circle.dx = Math.cos(angle) * currentSpeed;
                circle.dy = Math.sin(angle) * currentSpeed;
            }
        });

        scoreDisplay.textContent = `Score: ${score.toFixed(1)}`;

        draw(scaledRadius);
        requestAnimationFrame(update);
    }

    function handleMouseDown(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        for (const circle of bouncingCircles) {
            const dist = Math.hypot(mouseX - circle.x, mouseY - circle.y);
            if (dist < circle.radius * 1.5) { // Increased selection radius
                draggedCircle = circle;
                draggedCircle.startX = mouseX;
                draggedCircle.startY = mouseY;
                draggedCircle.isBeingDragged = false; // Flag to check if a significant drag occurred
                draggedCircle.prevDx = draggedCircle.dx; // Store current velocity
                draggedCircle.prevDy = draggedCircle.dy;
                draggedCircle.dx = 0; // Stop the ball
                draggedCircle.dy = 0;

                if (draggedCircle.charge > 0) {
                    score += draggedCircle.charge;
                    totalClickScore += draggedCircle.charge;
                    animatedTexts.push({
                        text: `+${draggedCircle.charge.toFixed(0)}`,
                        x: mouseX,
                        y: mouseY,
                        startTime: performance.now(),
                        duration: 1000
                    });
                }
                draggedCircle.charge = 0;
                break;
            }
        }

        if (!draggedCircle) {
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
    }

    function handleMouseMove(event) {
        const rect = canvas.getBoundingClientRect();
        mouse.x = event.clientX - rect.left;
        mouse.y = event.clientY - rect.top;

        if (draggedCircle && !draggedCircle.isBeingDragged) {
            const dragDistance = Math.hypot(mouse.x - draggedCircle.startX, mouse.y - draggedCircle.startY);
            if (dragDistance >= 2) {
                draggedCircle.isBeingDragged = true;
            }
        }
    }

    function handleMouseUp() {
        if (draggedCircle) {
            if (draggedCircle.isBeingDragged) {
                const angle = Math.atan2(draggedCircle.y - mouse.y, draggedCircle.x - mouse.x);
                const minSlingshotSpeed = baseSpeed; // Define minimum speed
                const speed = Math.max(minSlingshotSpeed, Math.min(200, Math.hypot(mouse.x - draggedCircle.x, mouse.y - draggedCircle.y)));
                draggedCircle.dx = Math.cos(angle) * speed;
                draggedCircle.dy = Math.sin(angle) * speed;
            } else {
                draggedCircle.dx = draggedCircle.prevDx;
                draggedCircle.dy = draggedCircle.prevDy;
            }
            draggedCircle.isBeingDragged = false;
            draggedCircle = null;
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

        const angle = Math.random() * 2 * Math.PI;
        const bouncyBallSpeed = baseSpeed * Math.pow(1.2, bouncyBallSpeedLevel);

        bouncingCircles.push({
            x: x,
            y: y,
            radius: radius,
            dx: Math.cos(angle) * bouncyBallSpeed,
            dy: Math.sin(angle) * bouncyBallSpeed,
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            lastHitTime: 0,
            charge: 0,
            isBeingDragged: false
        });
    }

    function buyBouncyBall() {
        const cost = getBouncyBallCost();
        if (score >= cost) {
            score -= cost;
            bouncyBalls++;
            bouncyBallCountDisplay.textContent = bouncyBalls;
            bouncyBallCostDisplay.textContent = getBouncyBallCost();
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

    function buyReduceFriction() {
        const cost = getReduceFrictionCost();
        if (score >= cost) {
            score -= cost;
            reduceFrictionLevel++;
            reduceFrictionLevelDisplay.textContent = reduceFrictionLevel;
            reduceFrictionCostDisplay.textContent = getReduceFrictionCost();
        }
    }

    function buyBouncyBallSpeed() {
        const cost = getBouncyBallSpeedCost();
        if (score >= cost) {
            score -= cost;
            bouncyBallSpeedLevel++;
            bouncyBallSpeedLevelDisplay.textContent = bouncyBallSpeedLevel;
            bouncyBallSpeedCostDisplay.textContent = getBouncyBallSpeedCost();
        }
    }

    function updateCharts() {
        const currentTime = Math.floor(performance.now() / 1000);

        // Score over time chart
        scoreChart.data.labels.push(currentTime);
        scoreChart.data.datasets[0].data.push(score);
        scoreChart.data.datasets[1].data.push(totalClickScore);
        scoreChart.data.datasets[2].data.push(totalBouncyBallScore);
        scoreChart.update();

        // Rate of increase chart
        const clickIncrease = totalClickScore - clickScoreAtLastChartUpdate;
        const bouncyBallIncrease = totalBouncyBallScore - bouncyBallScoreAtLastChartUpdate;
        const scoreIncrease = (score - scoreAtLastChartUpdate); // Total score increase
        scoreAtLastChartUpdate = score;
        clickScoreAtLastChartUpdate = totalClickScore;
        bouncyBallScoreAtLastChartUpdate = totalBouncyBallScore;

        rateChart.data.labels.push(currentTime);
        rateChart.data.datasets[0].data.push(scoreIncrease);
        rateChart.data.datasets[1].data.push(clickIncrease);
        rateChart.data.datasets[2].data.push(bouncyBallIncrease);
        rateChart.update();

        // Score source chart
        sourceChart.data.datasets[0].data[0] = totalClickScore;
        sourceChart.data.datasets[0].data[1] = totalBouncyBallScore;
        sourceChart.update();
    }

    window.rosebud = function() {
        score += 100000;
    }

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    buyBouncyBallButton.addEventListener('click', buyBouncyBall);
    buyQuantumEntanglementButton.addEventListener('click', buyQuantumEntanglement);
    buyBiggerClickButton.addEventListener('click', buyBiggerClick);
    buyMaxChargeButton.addEventListener('click', buyMaxCharge);
    buyReduceFrictionButton.addEventListener('click', buyReduceFriction);
    buyBouncyBallSpeedButton.addEventListener('click', buyBouncyBallSpeed);

    setInterval(updateCharts, 1000);

    requestAnimationFrame(update);
};