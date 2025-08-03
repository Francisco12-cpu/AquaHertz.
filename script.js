// AquaHertz - Marine Noise Pollution Simulator
// JavaScript for interactive functionality

class MarineSimulation {
    constructor() {
        this.isRunning = false;
        this.mode = 'manual';
        this.noiseSources = [];
        this.animals = [];
        this.selectedNoiseType = null;
        this.noiseLevel = 45;
        this.wellnessLevel = 85;
        this.stressedAnimals = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAnimals();
        this.updateMetrics();
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startSimulation());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSimulation());
        
        // Mode selection
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.mode = e.target.value;
                if (this.mode === 'auto') {
                    this.startAutomaticScenario();
                }
            });
        });
        
        // Noise type selection
        document.getElementById('noiseType').addEventListener('change', (e) => {
            this.selectedNoiseType = e.target.value;
            if (e.target.value) {
                document.getElementById('simulationCanvas').style.cursor = 'crosshair';
                this.showInstruction('Clique no ambiente marinho para posicionar a fonte de ruído');
            } else {
                document.getElementById('simulationCanvas').style.cursor = 'default';
            }
        });
        
        // Canvas click
        document.getElementById('simulationCanvas').addEventListener('click', (e) => {
            if (this.selectedNoiseType && this.mode === 'manual') {
                this.addNoiseSource(e);
            }
        });
        
        // Modal controls
        document.getElementById('infoBtn').addEventListener('click', () => {
            document.getElementById('infoModal').style.display = 'block';
        });
        
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('infoModal').style.display = 'none';
        });
        
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('infoModal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    setupAnimals() {
        this.animals = [
            { id: 'whale', element: document.querySelector('.marine-animal.whale'), state: 'normal', baseStress: 0 },
            { id: 'dolphin', element: document.querySelector('.marine-animal.dolphin'), state: 'normal', baseStress: 0 },
            { id: 'fish-group', element: document.querySelector('.marine-animal.fish-group'), state: 'normal', baseStress: 0 },
            { id: 'turtle', element: document.querySelector('.marine-animal.turtle'), state: 'normal', baseStress: 0 }
        ];
    }
    
    addNoiseSource(e) {
        const canvas = document.getElementById('simulationCanvas');
        const rect = canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        const noiseData = this.getNoiseData(this.selectedNoiseType);
        
        const noiseSource = {
            id: Date.now(),
            type: this.selectedNoiseType,
            x: x,
            y: y,
            intensity: noiseData.intensity,
            range: noiseData.range,
            color: noiseData.color
        };
        
        this.noiseSources.push(noiseSource);
        this.createNoiseSourceElement(noiseSource);
        this.calculateNoiseLevels();
        this.updateAnimalStates();
        this.updateMetrics();
        
        // Reset selection
        document.getElementById('noiseType').value = '';
        this.selectedNoiseType = null;
        document.getElementById('simulationCanvas').style.cursor = 'default';
    }
    
    getNoiseData(type) {
        const noiseTypes = {
            ship: { intensity: 130, range: 200, color: '#ff8000' },
            sonar: { intensity: 190, range: 300, color: '#ff0040' },
            drilling: { intensity: 160, range: 250, color: '#ffff00' },
            construction: { intensity: 150, range: 180, color: '#f97316' }
        };
        return noiseTypes[type] || { intensity: 100, range: 100, color: '#00ffff' };
    }
    
    createNoiseSourceElement(source) {
        const canvas = document.getElementById('simulationCanvas');
        const element = document.createElement('div');
        element.className = `noise-source ${source.type}`;
        element.style.left = `${source.x}%`;
        element.style.top = `${source.y}%`;
        element.style.color = source.color;
        element.innerHTML = this.getNoiseIcon(source.type);
        element.title = `${source.type} - ${source.intensity}dB`;
        
        // Add remove functionality
        element.addEventListener('dblclick', () => {
            this.removeNoiseSource(source.id);
            element.remove();
        });
        
        canvas.appendChild(element);
        
        // Create sound waves
        this.createSoundWaves(source, element);
    }
    
    getNoiseIcon(type) {
        const icons = {
            ship: '<i class="fas fa-ship"></i>',
            sonar: '<i class="fas fa-satellite-dish"></i>',
            drilling: '<i class="fas fa-industry"></i>',
            construction: '<i class="fas fa-hammer"></i>'
        };
        return icons[type] || '<i class="fas fa-volume-up"></i>';
    }
    
    createSoundWaves(source, sourceElement) {
        let waveCount = 0;
        const maxWaves = 3;
        
        const createWave = () => {
            if (!this.isRunning) return;
            
            const wave = document.createElement('div');
            wave.className = 'sound-wave';
            wave.style.left = `${source.x}%`;
            wave.style.top = `${source.y}%`;
            wave.style.borderColor = source.color;
            wave.style.width = '10px';
            wave.style.height = '10px';
            
            document.getElementById('simulationCanvas').appendChild(wave);
            
            // Animate wave expansion
            let size = 10;
            let opacity = 1;
            const interval = setInterval(() => {
                size += 15;
                opacity -= 0.05;
                wave.style.width = `${size}px`;
                wave.style.height = `${size}px`;
                wave.style.opacity = opacity;
                wave.style.left = `calc(${source.x}% - ${size/2}px)`;
                wave.style.top = `calc(${source.y}% - ${size/2}px)`;
                
                if (opacity <= 0 || size > source.range) {
                    clearInterval(interval);
                    wave.remove();
                }
            }, 50);
            
            setTimeout(() => {
                if (this.isRunning && waveCount < maxWaves) {
                    createWave();
                }
            }, 800);
            
            waveCount++;
        };
        
        if (this.isRunning) {
            createWave();
        }
    }
    
    calculateNoiseLevels() {
        if (this.noiseSources.length === 0) {
            this.noiseLevel = 45; // Natural ocean noise
            return;
        }
        
        // Combine noise from all sources
        let totalNoise = this.noiseSources.reduce((sum, source) => {
            return sum + source.intensity;
        }, 0);
        
        // Average and apply some dampening
        this.noiseLevel = Math.min(200, totalNoise / this.noiseSources.length + (this.noiseSources.length * 10));
    }
    
    updateAnimalStates() {
        this.stressedAnimals = 0;
        
        this.animals.forEach(animal => {
            let stress = 0;
            
            // Calculate stress from all noise sources
            this.noiseSources.forEach(source => {
                const distance = this.calculateDistance(animal, source);
                const stressContribution = Math.max(0, (source.intensity - distance) / 100);
                stress += stressContribution;
            });
            
            // Update animal state based on stress level
            animal.baseStress = stress;
            
            if (stress > 0.8) {
                animal.state = 'critical';
                animal.element.classList.add('stressed');
                this.stressedAnimals++;
            } else if (stress > 0.5) {
                animal.state = 'stressed';
                animal.element.classList.add('stressed');
                this.stressedAnimals++;
            } else if (stress > 0.2) {
                animal.state = 'alert';
                animal.element.classList.remove('stressed');
            } else {
                animal.state = 'normal';
                animal.element.classList.remove('stressed');
            }
        });
        
        // Calculate overall wellness
        const avgStress = this.animals.reduce((sum, animal) => sum + animal.baseStress, 0) / this.animals.length;
        this.wellnessLevel = Math.max(10, Math.min(100, 100 - (avgStress * 100)));
    }
    
    calculateDistance(animal, source) {
        const animalRect = animal.element.getBoundingClientRect();
        const canvas = document.getElementById('simulationCanvas');
        const canvasRect = canvas.getBoundingClientRect();
        
        const animalX = ((animalRect.left + animalRect.width/2 - canvasRect.left) / canvasRect.width) * 100;
        const animalY = ((animalRect.top + animalRect.height/2 - canvasRect.top) / canvasRect.height) * 100;
        
        const dx = animalX - source.x;
        const dy = animalY - source.y;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    updateMetrics() {
        // Update noise level
        document.getElementById('noiseLevel').textContent = `${Math.round(this.noiseLevel)} dB`;
        const noiseProgress = Math.min(100, (this.noiseLevel / 150) * 100);
        document.getElementById('noiseProgress').style.width = `${noiseProgress}%`;
        
        // Update wellness level
        document.getElementById('wellnessLevel').textContent = `${Math.round(this.wellnessLevel)}%`;
        document.getElementById('wellnessProgress').style.width = `${this.wellnessLevel}%`;
        
        // Update stressed animals count
        document.getElementById('stressedAnimals').textContent = this.stressedAnimals;
        
        // Update colors based on levels
        const noiseElement = document.getElementById('noiseLevel');
        const wellnessElement = document.getElementById('wellnessLevel');
        
        if (this.noiseLevel > 90) {
            noiseElement.style.color = '#ff0040';
        } else if (this.noiseLevel > 60) {
            noiseElement.style.color = '#ffff00';
        } else {
            noiseElement.style.color = '#00ff80';
        }
        
        if (this.wellnessLevel < 30) {
            wellnessElement.style.color = '#ff0040';
        } else if (this.wellnessLevel < 60) {
            wellnessElement.style.color = '#ffff00';
        } else {
            wellnessElement.style.color = '#00ff80';
        }
    }
    
    startSimulation() {
        this.isRunning = true;
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('stopBtn').style.display = 'inline-flex';
        
        this.showInstruction('Simulação iniciada! Observe os efeitos nos animais marinhos.');
        
        // Start wave animations for existing sources
        this.noiseSources.forEach(source => {
            const sourceElement = document.querySelector(`.noise-source[title*="${source.type}"]`);
            if (sourceElement) {
                this.createSoundWaves(source, sourceElement);
            }
        });
        
        // Start continuous updates
        this.simulationInterval = setInterval(() => {
            this.updateMetrics();
        }, 1000);
    }
    
    stopSimulation() {
        this.isRunning = false;
        document.getElementById('startBtn').style.display = 'inline-flex';
        document.getElementById('stopBtn').style.display = 'none';
        
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
        }
        
        // Remove all sound waves
        document.querySelectorAll('.sound-wave').forEach(wave => wave.remove());
        
        this.showInstruction('Simulação pausada');
    }
    
    resetSimulation() {
        this.stopSimulation();
        
        // Remove all noise sources
        this.noiseSources = [];
        document.querySelectorAll('.noise-source').forEach(source => source.remove());
        document.querySelectorAll('.sound-wave').forEach(wave => wave.remove());
        
        // Reset animal states
        this.animals.forEach(animal => {
            animal.state = 'normal';
            animal.baseStress = 0;
            animal.element.classList.remove('stressed');
        });
        
        // Reset metrics
        this.noiseLevel = 45;
        this.wellnessLevel = 85;
        this.stressedAnimals = 0;
        this.updateMetrics();
        
        // Reset mode to manual
        document.querySelector('input[name="mode"][value="manual"]').checked = true;
        this.mode = 'manual';
        
        // Reset noise type selection
        document.getElementById('noiseType').value = '';
        this.selectedNoiseType = null;
        
        this.showInstruction('Simulação resetada. Selecione uma fonte de ruído para começar.');
    }
    
    startAutomaticScenario() {
        this.resetSimulation();
        
        // Add multiple noise sources automatically
        setTimeout(() => {
            this.addAutomaticNoiseSource('ship', 25, 40);
        }, 1000);
        
        setTimeout(() => {
            this.addAutomaticNoiseSource('sonar', 70, 25);
        }, 2000);
        
        setTimeout(() => {
            this.addAutomaticNoiseSource('drilling', 50, 65);
        }, 3000);
        
        setTimeout(() => {
            this.startSimulation();
        }, 4000);
        
        this.showInstruction('Modo automático: Múltiplas fontes de ruído serão adicionadas');
    }
    
    addAutomaticNoiseSource(type, x, y) {
        const noiseData = this.getNoiseData(type);
        
        const noiseSource = {
            id: Date.now() + Math.random(),
            type: type,
            x: x,
            y: y,
            intensity: noiseData.intensity,
            range: noiseData.range,
            color: noiseData.color
        };
        
        this.noiseSources.push(noiseSource);
        this.createNoiseSourceElement(noiseSource);
        this.calculateNoiseLevels();
        this.updateAnimalStates();
        this.updateMetrics();
    }
    
    removeNoiseSource(id) {
        this.noiseSources = this.noiseSources.filter(source => source.id !== id);
        this.calculateNoiseLevels();
        this.updateAnimalStates();
        this.updateMetrics();
    }
    
    showInstruction(message) {
        const instruction = document.querySelector('.canvas-instruction');
        if (instruction) {
            instruction.textContent = message;
            instruction.style.color = '#00ffff';
            setTimeout(() => {
                instruction.style.color = '#94a3b8';
            }, 3000);
        }
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MarineSimulation();
    
    // Add some visual enhancements
    addParticleEffects();
    addWaterMovement();
});

// Add floating particles to simulate underwater environment
function addParticleEffects() {
    const canvas = document.getElementById('simulationCanvas');
    const particleCount = 15;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 255, 255, 0.3);
            border-radius: 50%;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float ${3 + Math.random() * 4}s ease-in-out infinite;
            animation-delay: ${Math.random() * 2}s;
        `;
        canvas.appendChild(particle);
    }
    
    // Add CSS animation for particles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) translateX(0px); }
            25% { transform: translateY(-10px) translateX(5px); }
            50% { transform: translateY(-5px) translateX(-5px); }
            75% { transform: translateY(-8px) translateX(3px); }
        }
    `;
    document.head.appendChild(style);
}

// Add subtle water movement effect
function addWaterMovement() {
    const canvas = document.getElementById('simulationCanvas');
    let offset = 0;
    
    setInterval(() => {
        offset += 0.5;
        canvas.style.backgroundImage = `
            linear-gradient(180deg, 
                hsl(195, 60%, 25%) 0%, 
                hsl(210, 70%, 15%) 30%, 
                hsl(220, 80%, 10%) 70%, 
                hsl(230, 90%, 5%) 100%),
            radial-gradient(circle at ${50 + Math.sin(offset * 0.02) * 10}% ${50 + Math.cos(offset * 0.015) * 10}%, 
                rgba(0, 255, 255, 0.05) 0%, transparent 50%)
        `;
    }, 100);
}