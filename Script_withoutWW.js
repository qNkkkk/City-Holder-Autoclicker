(function() {
    let isPaused = false;
    let intervalId;

    function getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function simulateTouch(tapArea) {
        const clientX = Math.floor(Math.random() * tapArea.width);
        const clientY = Math.floor(Math.random() * tapArea.height);

        const touchObj = new Touch({
            identifier: Date.now(),
            target: tapArea.element,
            clientX: tapArea.rect.left + clientX,
            clientY: tapArea.rect.top + clientY,
            radiusX: 2.5,
            radiusY: 2.5,
            rotationAngle: 10,
            force: 0.5
        });

        const touchEvent = new TouchEvent('touchstart', {
            touches: [touchObj],
            targetTouches: [touchObj],
            changedTouches: [touchObj],
            bubbles: true,
            cancelable: true,
            composed: true
        });

        tapArea.element.dispatchEvent(touchEvent);

        const touchEndEvent = new TouchEvent('touchend', {
            touches: [],
            targetTouches: [],
            changedTouches: [touchObj],
            bubbles: true,
            cancelable: true,
            composed: true
        });

        tapArea.element.dispatchEvent(touchEndEvent);

        console.clear();
    }

    function getEnergyValue() {
        const energyElement = document.querySelector('div._treasuryEnergy_ehrjx_1');
        let energyValue = null;
        if (energyElement) {
            const text = energyElement.textContent.trim();
            const parts = text.split('/');
            if (parts.length > 0) {
                const numberText = parts[0].replace(/[^0-9]/g, '');
                energyValue = parseInt(numberText);
                if (isNaN(energyValue)) {
                    energyValue = null;
                }
            }
        }
        return energyValue;
    }

    function startSimulation(tapArea) {
        const energyValue = getEnergyValue();
        if (energyValue < 25) {
            const pauseDuration = Math.floor(Math.random() * (20 - 15 + 1) + 15) * 60 * 1000;
            console.log(`Energy is low. Pausing for ${(pauseDuration / 60000).toFixed(2)} minutes.`);
            clearInterval(intervalId);
            setTimeout(() => {
                console.log('Resuming simulation.');
                startSimulationWithRandomInterval(tapArea);
            }, pauseDuration);
        } else {
            simulateTouch(tapArea);
            clearInterval(intervalId);
            startSimulationWithRandomInterval(tapArea);
        }
    }

    function startSimulationWithRandomInterval(tapArea) {
        intervalId = setInterval(() => {
            startSimulation(tapArea);
        }, getRandomInterval(20, 50));
    }

    function startWorker() {
        const tapAreaElement = document.querySelector('div._tapArea_1dguf_1');
        if (tapAreaElement) {
            const rect = tapAreaElement.getBoundingClientRect();
            const tapArea = { element: tapAreaElement, rect: rect, width: rect.width, height: rect.height };
            startSimulationWithRandomInterval(tapArea);
        } else {
            console.error("Tap area not found.");
        }
    }

    function stopWorker() {
        clearInterval(intervalId);
    }

    function createPauseButton() {
        let pauseButton = document.createElement('button');
        pauseButton.id = 'pauseButton';
        pauseButton.textContent = 'Pause';
        pauseButton.style.position = 'fixed';
        pauseButton.style.top = '10px';
        pauseButton.style.right = '10px';
        pauseButton.style.padding = '10px';
        pauseButton.style.backgroundColor = '#007bff';
        pauseButton.style.color = 'white';
        pauseButton.style.border = 'none';
        pauseButton.style.borderRadius = '5px';
        pauseButton.style.cursor = 'pointer';
        document.body.appendChild(pauseButton);

        pauseButton.addEventListener('click', () => {
            isPaused = !isPaused;
            if (isPaused) {
                stopWorker();
                pauseButton.textContent = 'Resume';
                pauseButton.style.backgroundColor = '#dc3545';
            } else {
                startWorker();
                pauseButton.textContent = 'Pause';
                pauseButton.style.backgroundColor = '#007bff';
            }
        });
    }

    createPauseButton();
    startWorker(); // Initial start
})();
