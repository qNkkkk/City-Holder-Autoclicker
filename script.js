(function() {
    let isPaused = false;
    let worker;

    // Создаем и запускаем Web Worker
    function startWorker() {
        const workerScript = `
            let intervalId;

            function getRandomInterval(min, max) {
                return Math.floor(Math.random() * (max - min + 1)) + min;
            }

            function simulateTouch(tapArea) {
                const clientX = Math.floor(Math.random() * tapArea.width);
                const clientY = Math.floor(Math.random() * tapArea.height);

                self.postMessage({
                    type: 'simulateTouch',
                    clientX,
                    clientY
                });
            }

            function handleTouch(tapArea) {
                self.postMessage({ type: 'getEnergyValue' });

                self.onmessage = function(e) {
                    if (e.data.type === 'energyValue') {
                        const energyValue = e.data.value;
                        if (energyValue < 25) {
                            const pauseDuration = Math.floor(Math.random() * (20 - 15 + 1) + 15) * 60 * 1000;
                            self.postMessage({ type: 'pause', duration: pauseDuration });
                            clearInterval(intervalId);
                            setTimeout(() => {
                                self.postMessage({ type: 'resume' });
                                startSimulation(tapArea);
                            }, pauseDuration);
                        } else {
                            simulateTouch(tapArea);
                            clearInterval(intervalId);
                            startSimulationWithRandomInterval(tapArea);
                        }
                    }
                };
            }

            function startSimulation(tapArea) {
                handleTouch(tapArea);
            }

            function startSimulationWithRandomInterval(tapArea) {
                intervalId = setInterval(() => {
                    startSimulation(tapArea);
                }, getRandomInterval(20, 50));
            }

            self.onmessage = function(e) {
                if (e.data.type === 'start') {
                    startSimulationWithRandomInterval(e.data.tapArea);
                } else if (e.data.type === 'stop') {
                    clearInterval(intervalId);
                }
            };
        `;

        const blob = new Blob([workerScript], { type: 'application/javascript' });
        worker = new Worker(URL.createObjectURL(blob));

        worker.onmessage = function(event) {
            if (event.data.type === 'simulateTouch') {
                const tapArea = document.querySelector('div._tapArea_1dguf_1');
                if (tapArea) {
                    const touchObj = new Touch({
                        identifier: Date.now(),
                        target: tapArea,
                        clientX: event.data.clientX,
                        clientY: event.data.clientY,
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
                        cancelable: true
                    });

                    tapArea.dispatchEvent(touchEvent);

                    const touchEndEvent = new TouchEvent('touchend', {
                        touches: [],
                        targetTouches: [],
                        changedTouches: [touchObj],
                        bubbles: true,
                        cancelable: true
                    });

                    tapArea.dispatchEvent(touchEndEvent);

                    console.clear();
                }
            } else if (event.data.type === 'getEnergyValue') {
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
                worker.postMessage({ type: 'energyValue', value: energyValue });
            } else if (event.data.type === 'pause') {
                console.log(`Energy is low. Pausing for ${(event.data.duration / 60000).toFixed(2)} minutes.`);
            } else if (event.data.type === 'resume') {
                console.log('Resuming simulation.');
            }
        };

        const tapArea = document.querySelector('div._tapArea_1dguf_1');
        if (tapArea) {
            const rect = tapArea.getBoundingClientRect();
            worker.postMessage({ type: 'start', tapArea: { width: rect.width, height: rect.height } });
        } else {
            console.error("Tap area not found.");
        }
    }

    function stopWorker() {
        if (worker) {
            worker.postMessage('stop');
            worker.terminate();
            worker = null;
        }
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
