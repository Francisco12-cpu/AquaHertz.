// AquaHertz - Marine Noise Pollution Simulator
// Enhanced JavaScript for fully functional marine ecosystem simulation

class MarineEcosystemSimulator {
    constructor() {
        this.canvas = document.getElementById('oceanCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.isRunning = false;
        this.isPaused = false;
        this.mode = 'manual';
        this.animationFrame = null;
        
        // Simulation state
        this.animals = [];
        this.noiseSources = [];
        this.soundWaves = [];
        this.particles = [];
        
        // Metrics
        this.totalAnimals = 60;
        this.averageNoiseLevel = 45;
        this.wellnessIndex = 85;
        this.criticalStressPercentage = 0;
        
        // Auto mode settings
        this.autoModeTimer = null;
        this.nextAutoEventTime = 0;
        this.autoEventInterval = 5000; // 5 seconds base interval
        
        // Canvas setup
        this.setupCanvas();
        this.setupEventListeners();
        this.createFloatingParticles();
        this.startBackgroundAnimation();
    }
    
    setupCanvas() {
        // Set canvas resolution
        const rect = this.canvas.getBoundingClientRect();
        this.canvas.width = 800;
        this.canvas.height = 500;
        
        // Enable mouse interaction
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
    }
    
    setupEventListeners() {
        // Control buttons
        document.getElementById('startBtn').addEventListener('click', () => this.startSimulation());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseSimulation());
        document.getElementById('stopBtn').addEventListener('click', () => this.stopSimulation());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetSimulation());
        
        // Mode selection
        document.querySelectorAll('input[name="mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => this.setMode(e.target.value));
        });
        
        // Animal count slider
        const animalSlider = document.getElementById('animalCount');
        const animalDisplay = document.getElementById('animalCountDisplay');
        animalSlider.addEventListener('input', (e) => {
            this.totalAnimals = parseInt(e.target.value);
            animalDisplay.textContent = this.totalAnimals;
            if (!this.isRunning) {
                this.generateAnimals();
            }
        });
        
        // Noise type selection
        document.getElementById('noiseType').addEventListener('change', (e) => {
            this.selectedNoiseType = e.target.value;
            this.updateCanvasInstruction();
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
        
        // Panel toggle
        document.getElementById('togglePanel').addEventListener('click', () => {
            const container = document.querySelector('.metrics-container');
            container.classList.toggle('hidden');
        });
    }
    
    updateCanvasInstruction() {
        const instruction = document.getElementById('canvasInstruction');
        if (this.isRunning) {
            if (this.mode === 'manual' && this.selectedNoiseType) {
                instruction.textContent = 'Clique no oceano para adicionar fonte de ruído';
            } else if (this.mode === 'auto') {
                instruction.textContent = 'Modo automático ativo - sons surgem automaticamente';
            } else {
                instruction.textContent = 'Simulação em execução';
            }
        } else {
            instruction.textContent = 'Configure a simulação e clique em Iniciar';
        }
    }
    
    // Animal Generation and Management
    generateAnimals() {
        this.animals = [];
        
        for (let i = 0; i < this.totalAnimals; i++) {
            const animalType = this.getRandomAnimalType();
            const animal = {
                id: i,
                type: animalType,
                x: Math.random() * (this.canvas.width - 60) + 30,
                y: Math.random() * (this.canvas.height - 60) + 30,
                targetX: 0,
                targetY: 0,
                vx: 0,
                vy: 0,
                size: this.getAnimalSize(animalType),
                color: this.getAnimalColor(animalType),
                stress: 0,
                stressColor: '#0080ff',
                maxSpeed: this.getAnimalSpeed(animalType),
                groupId: animalType === 'fish' ? Math.floor(Math.random() * 8) : null,
                lastDirectionChange: 0,
                direction: Math.random() * Math.PI * 2,
                amplitude: Math.random() * 20 + 10,
                phase: Math.random() * Math.PI * 2
            };
            
            this.setAnimalTarget(animal);
            this.animals.push(animal);
        }
    }
    
    getRandomAnimalType() {
        const types = ['fish', 'dolphin', 'turtle', 'whale'];
        const weights = [0.5, 0.2, 0.2, 0.1]; // Fish are most common
        const rand = Math.random();
        let sum = 0;
        
        for (let i = 0; i < types.length; i++) {
            sum += weights[i];
            if (rand <= sum) return types[i];
        }
        return 'fish';
    }
    
    getAnimalSize(type) {
        const sizes = {
            fish: 8 + Math.random() * 4,
            dolphin: 16 + Math.random() * 6,
            turtle: 14 + Math.random() * 4,
            whale: 20 + Math.random() * 8
        };
        return sizes[type] || 8;
    }
    
    getAnimalColor(type) {
        const colors = {
            fish: '#00ff80',
            dolphin: '#00ffff',
            turtle: '#ffff00',
            whale: '#0080ff'
        };
        return colors[type] || '#00ff80';
    }
    
    getAnimalSpeed(type) {
        const speeds = {
            fish: 1.5 + Math.random() * 1,
            dolphin: 2 + Math.random() * 1.5,
            turtle: 0.5 + Math.random() * 0.5,
            whale: 0.8 + Math.random() * 0.7
        };
        return speeds[type] || 1;
    }
    
    setAnimalTarget(animal) {
        const margin = 50;
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Create zones to distribute animals more evenly
        const zones = [
            { x: 0.2, y: 0.2 }, { x: 0.8, y: 0.2 }, // Top zones
            { x: 0.2, y: 0.5 }, { x: 0.8, y: 0.5 }, // Middle zones
            { x: 0.2, y: 0.8 }, { x: 0.8, y: 0.8 }, // Bottom zones
            { x: 0.5, y: 0.3 }, { x: 0.5, y: 0.7 }  // Central zones
        ];
        
        // Avoid center clustering by biasing away from center
        const currentDistanceFromCenter = Math.sqrt(
            Math.pow(animal.x - centerX, 2) + Math.pow(animal.y - centerY, 2)
        );
        
        // If animal is too close to center, bias towards edges
        if (currentDistanceFromCenter < 100) {
            const edgeZones = zones.filter((zone, index) => index < 6); // Exclude central zones
            const selectedZone = edgeZones[Math.floor(Math.random() * edgeZones.length)];
            animal.targetX = selectedZone.x * this.canvas.width;
            animal.targetY = selectedZone.y * this.canvas.height;
        } else {
            // Normal random movement with zone preference
            const selectedZone = zones[Math.floor(Math.random() * zones.length)];
            const zoneVariation = 100; // Pixels of variation around zone center
            
            animal.targetX = Math.max(margin, Math.min(this.canvas.width - margin,
                selectedZone.x * this.canvas.width + (Math.random() - 0.5) * zoneVariation));
            animal.targetY = Math.max(margin, Math.min(this.canvas.height - margin,
                selectedZone.y * this.canvas.height + (Math.random() - 0.5) * zoneVariation));
        }
    }
    
    // Animation and Movement
    updateAnimals() {
        const currentTime = Date.now();
        
        this.animals.forEach(animal => {
            // Update stress-based behavior
            this.updateAnimalStress(animal);
            this.updateAnimalMovement(animal, currentTime);
            this.updateAnimalPosition(animal);
        });
        
        this.calculateMetrics();
    }
    
    updateAnimalMovement(animal, currentTime) {
        const dx = animal.targetX - animal.x;
        const dy = animal.targetY - animal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if need new target
        if (distance < 20 || currentTime - animal.lastDirectionChange > 3000 + Math.random() * 2000) {
            this.setAnimalTarget(animal);
            animal.lastDirectionChange = currentTime;
        }
        
        // Apply stress-based movement modifications
        let speedMultiplier = 1;
        let erraticMovement = 0;
        
        if (animal.stress > 80) {
            // Critical stress - erratic movement
            speedMultiplier = 2;
            erraticMovement = 0.5;
        } else if (animal.stress > 60) {
            // High stress - faster movement
            speedMultiplier = 1.5;
            erraticMovement = 0.3;
        } else if (animal.stress > 30) {
            // Medium stress - slightly faster
            speedMultiplier = 1.2;
            erraticMovement = 0.1;
        }
        
        // Calculate movement based on animal type
        switch (animal.type) {
            case 'fish':
                this.updateFishMovement(animal, speedMultiplier, erraticMovement);
                break;
            case 'dolphin':
                this.updateDolphinMovement(animal, speedMultiplier, erraticMovement);
                break;
            case 'turtle':
                this.updateTurtleMovement(animal, speedMultiplier, erraticMovement);
                break;
            case 'whale':
                this.updateWhaleMovement(animal, speedMultiplier, erraticMovement);
                break;
        }
    }
    
    updateFishMovement(animal, speedMultiplier, erraticMovement) {
        // Fish move in schools with zigzag patterns and schooling behavior
        const dx = animal.targetX - animal.x;
        const dy = animal.targetY - animal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            // Base movement toward target
            animal.vx = (dx / distance) * animal.maxSpeed * speedMultiplier;
            animal.vy = (dy / distance) * animal.maxSpeed * speedMultiplier;
            
            // Add schooling behavior - fish are attracted to nearby fish
            let schoolX = 0, schoolY = 0, schoolCount = 0;
            const schoolingRadius = 60;
            
            this.animals.forEach(other => {
                if (other.type === 'fish' && other.id !== animal.id) {
                    const otherDistance = this.calculateDistance(animal.x, animal.y, other.x, other.y);
                    if (otherDistance < schoolingRadius) {
                        schoolX += other.x;
                        schoolY += other.y;
                        schoolCount++;
                    }
                }
            });
            
            // Apply schooling force
            if (schoolCount > 0) {
                const avgSchoolX = schoolX / schoolCount;
                const avgSchoolY = schoolY / schoolCount;
                const schoolDx = avgSchoolX - animal.x;
                const schoolDy = avgSchoolY - animal.y;
                const schoolForce = 0.2; // Moderate schooling force
                
                animal.vx += schoolDx * schoolForce * 0.01;
                animal.vy += schoolDy * schoolForce * 0.01;
            }
            
            // Add zigzag pattern
            const zigzag = Math.sin(Date.now() * 0.008 + animal.phase) * 0.8;
            const perpX = -animal.vy; // Perpendicular to movement direction
            const perpY = animal.vx;
            const perpLength = Math.sqrt(perpX * perpX + perpY * perpY);
            
            if (perpLength > 0) {
                animal.vx += (perpX / perpLength) * zigzag;
                animal.vy += (perpY / perpLength) * zigzag;
            }
            
            // Add erratic movement if stressed
            if (erraticMovement > 0) {
                animal.vx += (Math.random() - 0.5) * erraticMovement * 3;
                animal.vy += (Math.random() - 0.5) * erraticMovement * 3;
            }
        }
    }
    
    updateDolphinMovement(animal, speedMultiplier, erraticMovement) {
        // Dolphins move in arcs
        const dx = animal.targetX - animal.x;
        const dy = animal.targetY - animal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            animal.vx = (dx / distance) * animal.maxSpeed * speedMultiplier;
            animal.vy = (dy / distance) * animal.maxSpeed * speedMultiplier;
            
            // Add arc movement
            const arc = Math.sin(Date.now() * 0.005 + animal.phase) * 0.5;
            animal.vx += arc;
            animal.vy += arc * 0.5;
            
            // Stressed dolphins swim in circles
            if (erraticMovement > 0.3) {
                const circleSpeed = 0.05;
                animal.direction += circleSpeed;
                animal.vx = Math.cos(animal.direction) * animal.maxSpeed * speedMultiplier;
                animal.vy = Math.sin(animal.direction) * animal.maxSpeed * speedMultiplier;
            }
        }
    }
    
    updateTurtleMovement(animal, speedMultiplier, erraticMovement) {
        // Turtles move slowly and steadily
        const dx = animal.targetX - animal.x;
        const dy = animal.targetY - animal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            animal.vx = (dx / distance) * animal.maxSpeed * speedMultiplier;
            animal.vy = (dy / distance) * animal.maxSpeed * speedMultiplier;
            
            // Stressed turtles change direction abruptly
            if (erraticMovement > 0.2 && Math.random() < 0.02) {
                this.setAnimalTarget(animal);
            }
        }
    }
    
    updateWhaleMovement(animal, speedMultiplier, erraticMovement) {
        // Whales move in large, graceful curves
        const dx = animal.targetX - animal.x;
        const dy = animal.targetY - animal.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
            animal.vx = (dx / distance) * animal.maxSpeed * speedMultiplier;
            animal.vy = (dy / distance) * animal.maxSpeed * speedMultiplier;
            
            // Add gentle curve
            const curve = Math.sin(Date.now() * 0.002 + animal.phase) * 0.3;
            animal.vx += curve;
            
            // Stressed whales may change migration routes
            if (erraticMovement > 0.3 && Math.random() < 0.01) {
                this.setAnimalTarget(animal);
            }
        }
    }
    
    updateAnimalPosition(animal) {
        // Update position
        animal.x += animal.vx;
        animal.y += animal.vy;
        
        // Boundary checking with stress-based collision
        const margin = animal.size + 10;
        if (animal.x < margin || animal.x > this.canvas.width - margin) {
            animal.vx *= -1;
            animal.x = Math.max(margin, Math.min(this.canvas.width - margin, animal.x));
            if (animal.stress > 60) {
                animal.stress += 5; // Collision increases stress
            }
        }
        if (animal.y < margin || animal.y > this.canvas.height - margin) {
            animal.vy *= -1;
            animal.y = Math.max(margin, Math.min(this.canvas.height - margin, animal.y));
            if (animal.stress > 60) {
                animal.stress += 5; // Collision increases stress
            }
        }
    }
    
    // Stress Calculation
    updateAnimalStress(animal) {
        let totalStress = 0;
        
        // Calculate stress from all active noise sources
        this.noiseSources.forEach(source => {
            const distance = this.calculateDistance(animal.x, animal.y, source.x, source.y);
            const maxDistance = source.range || 150;
            
            if (distance < maxDistance) {
                // Stress decreases with distance
                const proximityFactor = 1 - (distance / maxDistance);
                const intensityFactor = source.intensity / 200; // Normalize intensity
                const stressContribution = proximityFactor * intensityFactor * 100;
                totalStress += stressContribution;
            }
        });
        
        // Apply stress with decay over time
        animal.stress = Math.max(0, Math.min(100, totalStress));
        
        // Natural stress decay when no noise sources
        if (this.noiseSources.length === 0 && animal.stress > 0) {
            animal.stress = Math.max(0, animal.stress - 0.5);
        }
        
        // Update stress color
        animal.stressColor = this.getStressColor(animal.stress);
    }
    
    getStressColor(stress) {
        if (stress <= 30) return '#0080ff'; // Blue - calm
        if (stress <= 60) return '#ffff00'; // Yellow - scared
        if (stress <= 80) return '#ff8000'; // Orange - stressed
        return '#ff0040'; // Red - critical
    }
    
    calculateDistance(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Noise Sources and Sound Waves
    handleCanvasClick(e) {
        if (!this.isRunning || this.mode !== 'manual' || !this.selectedNoiseType) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * this.canvas.width;
        const y = ((e.clientY - rect.top) / rect.height) * this.canvas.height;
        
        this.addNoiseSource(x, y, this.selectedNoiseType);
        
        // Reset selection
        document.getElementById('noiseType').value = '';
        this.selectedNoiseType = null;
        this.updateCanvasInstruction();
    }
    
    addNoiseSource(x, y, type) {
        const noiseData = this.getNoiseSourceData(type);
        
        const source = {
            id: Date.now(),
            type: type,
            x: x,
            y: y,
            intensity: noiseData.intensity,
            range: noiseData.range,
            duration: noiseData.duration,
            color: noiseData.color,
            createdAt: Date.now(),
            wavePhase: 0
        };
        
        this.noiseSources.push(source);
        this.updateStatusDisplay(`${type} adicionado - ${source.intensity}dB`);
    }
    
    getNoiseSourceData(type) {
        const sources = {
            ship: { intensity: 130, range: 200, duration: 15000, color: '#ff8000' },
            sonar: { intensity: 190, range: 300, duration: 8000, color: '#ff0040' },
            drilling: { intensity: 160, range: 250, duration: 20000, color: '#ffff00' },
            construction: { intensity: 150, range: 180, duration: 12000, color: '#f97316' }
        };
        return sources[type] || { intensity: 100, range: 100, duration: 10000, color: '#00ffff' };
    }
    
    updateNoiseSources() {
        const currentTime = Date.now();
        
        // Remove expired noise sources
        this.noiseSources = this.noiseSources.filter(source => {
            return (currentTime - source.createdAt) < source.duration;
        });
        
        // Update wave phases
        this.noiseSources.forEach(source => {
            source.wavePhase = (currentTime - source.createdAt) * 0.001;
        });
    }
    
    // Auto Mode Management
    setMode(mode) {
        this.mode = mode;
        this.updateCanvasInstruction();
        
        if (mode === 'auto' && this.isRunning) {
            this.startAutoMode();
        } else {
            this.stopAutoMode();
        }
    }
    
    startAutoMode() {
        this.stopAutoMode(); // Clear any existing auto mode
        this.nextAutoEventTime = Date.now() + Math.random() * 3000 + 2000; // 2-5 seconds
        this.updateStatusDisplay('Modo automático ativado');
    }
    
    stopAutoMode() {
        if (this.autoModeTimer) {
            clearTimeout(this.autoModeTimer);
            this.autoModeTimer = null;
        }
    }
    
    updateAutoMode() {
        if (this.mode !== 'auto' || !this.isRunning) return;
        
        const currentTime = Date.now();
        
        if (currentTime >= this.nextAutoEventTime) {
            this.generateRandomNoiseEvent();
            // Schedule next event
            this.nextAutoEventTime = currentTime + Math.random() * 10000 + 5000; // 5-15 seconds
        }
    }
    
    generateRandomNoiseEvent() {
        const types = ['ship', 'sonar', 'drilling', 'construction'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        const x = Math.random() * (this.canvas.width - 100) + 50;
        const y = Math.random() * (this.canvas.height - 100) + 50;
        
        this.addNoiseSource(x, y, randomType);
    }
    
    // Simulation Control
    startSimulation() {
        this.isRunning = true;
        this.isPaused = false;
        this.generateAnimals();
        
        document.getElementById('startBtn').style.display = 'none';
        document.getElementById('pauseBtn').style.display = 'inline-flex';
        document.getElementById('stopBtn').style.display = 'inline-flex';
        
        this.updateStatusDisplay('Simulação iniciada');
        this.updateCanvasInstruction();
        
        if (this.mode === 'auto') {
            this.startAutoMode();
        }
        
        this.animate();
    }
    
    pauseSimulation() {
        this.isPaused = !this.isPaused;
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.isPaused) {
            pauseBtn.innerHTML = '<i class="fas fa-play"></i> Continuar';
            this.updateStatusDisplay('Simulação pausada');
            if (this.animationFrame) {
                cancelAnimationFrame(this.animationFrame);
            }
        } else {
            pauseBtn.innerHTML = '<i class="fas fa-pause"></i> Pausar';
            this.updateStatusDisplay('Simulação retomada');
            this.animate();
        }
    }
    
    stopSimulation() {
        this.isRunning = false;
        this.isPaused = false;
        this.stopAutoMode();
        
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        document.getElementById('startBtn').style.display = 'inline-flex';
        document.getElementById('pauseBtn').style.display = 'none';
        document.getElementById('stopBtn').style.display = 'none';
        document.getElementById('pauseBtn').innerHTML = '<i class="fas fa-pause"></i> Pausar';
        
        this.updateStatusDisplay('Simulação parada');
        this.updateCanvasInstruction();
    }
    
    resetSimulation() {
        this.stopSimulation();
        this.animals = [];
        this.noiseSources = [];
        this.soundWaves = [];
        
        // Reset metrics
        this.averageNoiseLevel = 45;
        this.wellnessIndex = 85;
        this.criticalStressPercentage = 0;
        
        this.updateMetrics();
        this.updateStatusDisplay('Simulação resetada');
        this.clearCanvas();
        this.drawBackground();
        this.drawParticles();
    }
    
    // Rendering
    animate() {
        if (!this.isRunning || this.isPaused) return;
        
        this.clearCanvas();
        this.drawBackground();
        this.drawParticles();
        
        this.updateAnimals();
        this.updateNoiseSources();
        this.updateAutoMode();
        
        this.drawAnimals();
        this.drawNoiseSources();
        this.drawSoundWaves();
        
        this.updateMetrics();
        
        this.animationFrame = requestAnimationFrame(() => this.animate());
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawBackground() {
        // Draw ocean gradient
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(70, 130, 180, 0.8)');
        gradient.addColorStop(0.3, 'rgba(25, 25, 112, 0.9)');
        gradient.addColorStop(0.7, 'rgba(0, 0, 139, 0.95)');
        gradient.addColorStop(1, 'rgba(0, 0, 0, 1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    drawParticles() {
        this.ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
        this.particles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawAnimals() {
        this.animals.forEach(animal => {
            this.ctx.fillStyle = animal.stressColor;
            this.ctx.beginPath();
            
            // Draw animal based on type
            switch (animal.type) {
                case 'fish':
                    this.drawFish(animal);
                    break;
                case 'dolphin':
                    this.drawDolphin(animal);
                    break;
                case 'turtle':
                    this.drawTurtle(animal);
                    break;
                case 'whale':
                    this.drawWhale(animal);
                    break;
            }
            
            this.ctx.fill();
            
            // Draw stress indicator
            if (animal.stress > 30) {
                this.drawStressIndicator(animal);
            }
        });
    }
    
    drawFish(animal) {
        const x = animal.x;
        const y = animal.y;
        const size = animal.size;
        
        // Fish body (ellipse)
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size, size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Fish tail
        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x - size * 1.5, y - size * 0.5);
        this.ctx.lineTo(x - size * 1.5, y + size * 0.5);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawDolphin(animal) {
        const x = animal.x;
        const y = animal.y;
        const size = animal.size;
        
        // Dolphin body
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size, size * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Dorsal fin
        this.ctx.beginPath();
        this.ctx.moveTo(x, y - size * 0.5);
        this.ctx.lineTo(x - size * 0.3, y - size * 0.8);
        this.ctx.lineTo(x + size * 0.3, y - size * 0.8);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawTurtle(animal) {
        const x = animal.x;
        const y = animal.y;
        const size = animal.size;
        
        // Turtle shell
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Shell pattern
        this.ctx.strokeStyle = animal.stressColor;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x - size * 0.5, y);
        this.ctx.lineTo(x + size * 0.5, y);
        this.ctx.moveTo(x, y - size * 0.5);
        this.ctx.lineTo(x, y + size * 0.5);
        this.ctx.stroke();
    }
    
    drawWhale(animal) {
        const x = animal.x;
        const y = animal.y;
        const size = animal.size;
        
        // Whale body
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size, size * 0.4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Whale tail
        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y);
        this.ctx.lineTo(x - size * 1.5, y - size * 0.8);
        this.ctx.lineTo(x - size * 1.2, y);
        this.ctx.lineTo(x - size * 1.5, y + size * 0.8);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawStressIndicator(animal) {
        const x = animal.x;
        const y = animal.y - animal.size - 10;
        const width = 20;
        const height = 4;
        
        // Background bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        this.ctx.fillRect(x - width/2, y, width, height);
        
        // Stress bar
        this.ctx.fillStyle = animal.stressColor;
        this.ctx.fillRect(x - width/2, y, (animal.stress / 100) * width, height);
    }
    
    drawNoiseSources() {
        this.noiseSources.forEach(source => {
            this.ctx.fillStyle = source.color;
            this.ctx.strokeStyle = source.color;
            
            // Draw source icon
            this.ctx.fillRect(source.x - 8, source.y - 8, 16, 16);
            
            // Draw source label
            this.ctx.fillStyle = 'white';
            this.ctx.font = '10px Inter';
            this.ctx.fillText(`${source.intensity}dB`, source.x - 15, source.y - 15);
        });
    }
    
    drawSoundWaves() {
        this.noiseSources.forEach(source => {
            const currentTime = Date.now();
            const age = currentTime - source.createdAt;
            
            // Draw multiple wave rings
            for (let i = 0; i < 3; i++) {
                const waveAge = age - (i * 800); // Waves 800ms apart
                if (waveAge > 0) {
                    const radius = (waveAge * 0.1) % source.range;
                    const opacity = Math.max(0, 1 - (radius / source.range));
                    
                    this.ctx.strokeStyle = source.color + Math.floor(opacity * 255).toString(16).padStart(2, '0');
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(source.x, source.y, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                }
            }
        });
    }
    
    // Background Effects
    createFloatingParticles() {
        this.particles = [];
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }
    }
    
    startBackgroundAnimation() {
        setInterval(() => {
            this.particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Wrap around edges
                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;
            });
            
            // Redraw if not running simulation
            if (!this.isRunning) {
                this.clearCanvas();
                this.drawBackground();
                this.drawParticles();
            }
        }, 50);
    }
    
    // Metrics and UI Updates
    calculateMetrics() {
        if (this.animals.length === 0) return;
        
        // Calculate average noise level
        if (this.noiseSources.length > 0) {
            this.averageNoiseLevel = this.noiseSources.reduce((sum, source) => sum + source.intensity, 0) / this.noiseSources.length;
        } else {
            this.averageNoiseLevel = 45; // Natural ocean noise
        }
        
        // Calculate wellness index
        const healthyAnimals = this.animals.filter(animal => animal.stress < 30).length;
        this.wellnessIndex = (healthyAnimals / this.animals.length) * 100;
        
        // Calculate critical stress percentage
        const criticalAnimals = this.animals.filter(animal => animal.stress > 80).length;
        this.criticalStressPercentage = (criticalAnimals / this.animals.length) * 100;
    }
    
    updateMetrics() {
        // Update noise level
        document.getElementById('noiseLevel').textContent = `${Math.round(this.averageNoiseLevel)} dB`;
        const noiseProgress = Math.min(100, (this.averageNoiseLevel / 150) * 100);
        document.getElementById('noiseProgress').style.width = `${noiseProgress}%`;
        
        // Update wellness level
        document.getElementById('wellnessLevel').textContent = `${Math.round(this.wellnessIndex)}%`;
        document.getElementById('wellnessProgress').style.width = `${this.wellnessIndex}%`;
        
        // Update critical stress
        document.getElementById('criticalStress').textContent = `${Math.round(this.criticalStressPercentage)}%`;
        document.getElementById('criticalProgress').style.width = `${this.criticalStressPercentage}%`;
        
        // Update active animals count
        document.getElementById('activeAnimals').textContent = this.animals.length;
        
        // Update metric colors based on levels
        const noiseElement = document.getElementById('noiseLevel');
        const wellnessElement = document.getElementById('wellnessLevel');
        const criticalElement = document.getElementById('criticalStress');
        
        // Noise level colors
        if (this.averageNoiseLevel > 90) {
            noiseElement.style.color = '#ff0040';
        } else if (this.averageNoiseLevel > 60) {
            noiseElement.style.color = '#ffff00';
        } else {
            noiseElement.style.color = '#00ff80';
        }
        
        // Wellness colors
        if (this.wellnessIndex < 30) {
            wellnessElement.style.color = '#ff0040';
        } else if (this.wellnessIndex < 60) {
            wellnessElement.style.color = '#ffff00';
        } else {
            wellnessElement.style.color = '#00ff80';
        }
        
        // Critical stress colors
        if (this.criticalStressPercentage > 20) {
            criticalElement.style.color = '#ff0040';
        } else if (this.criticalStressPercentage > 10) {
            criticalElement.style.color = '#ff8000';
        } else {
            criticalElement.style.color = '#00ff80';
        }
    }
    
    updateStatusDisplay(message) {
        const statusDisplay = document.getElementById('statusDisplay');
        statusDisplay.textContent = message;
        
        // Add temporary highlight effect
        statusDisplay.style.borderColor = '#00ffff';
        statusDisplay.style.boxShadow = '0 0 15px rgba(0, 255, 255, 0.5)';
        
        setTimeout(() => {
            statusDisplay.style.borderColor = 'rgba(0, 255, 255, 0.5)';
            statusDisplay.style.boxShadow = '0 0 10px rgba(0, 255, 255, 0.3)';
        }, 2000);
    }
    
    handleCanvasHover(e) {
        if (!this.isRunning || this.mode !== 'manual' || !this.selectedNoiseType) return;
        
        this.canvas.style.cursor = 'crosshair';
    }
}

// Initialize the simulation when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MarineEcosystemSimulator();
});
