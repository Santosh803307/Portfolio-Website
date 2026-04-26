const API_BASE_URL = 'http://localhost:5001/api';
fetch(`${API_BASE_URL}/projects`)

AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

const cursor = document.querySelector('.cursor');
const cursorFollower = document.querySelector('.cursor-follower');

if (cursor && cursorFollower) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
        cursorFollower.style.transform = `translate(${e.clientX - 14}px, ${e.clientY - 14}px)`;
    });
    
    document.querySelectorAll('a, button, .btn').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorFollower.style.transform = 'scale(1.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursorFollower.style.transform = 'scale(1)';
        });
    });
}

window.addEventListener('load', () => {
    const loader = document.querySelector('.loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hide');
        }, 800);
    }
});

if (typeof Typed !== 'undefined') {
    new Typed('.typing-text', {
        strings: ['Full Stack Developer', 'UI/UX Enthusiast', 'Problem Solver', 'Tech Architect'],
        typeSpeed: 70,
        backSpeed: 40,
        backDelay: 2000,
        loop: true
    });
}

const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

// ============================================
// SMOOTH SCROLL WITH ACTIVE LINK HIGHLIGHT
// ============================================
const sections = document.querySelectorAll('section');
const navItems = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });
});

// Smooth Scroll for Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId && targetId.startsWith('#') && targetId.length > 1) {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        
        // Close mobile menu
        if (navLinks && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
        }
    });
});

// ============================================
// NAVBAR BACKGROUND ON SCROLL
// ============================================
const header = document.querySelector('header');
if (header) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(10, 10, 15, 0.95)';
            header.style.backdropFilter = 'blur(12px)';
            header.style.borderBottom = '1px solid rgba(74, 158, 255, 0.3)';
        } else {
            header.style.background = 'rgba(10, 10, 15, 0.85)';
            header.style.backdropFilter = 'blur(12px)';
            header.style.borderBottom = '1px solid rgba(74, 158, 255, 0.2)';
        }
    });
}

// ============================================
// CONTACT FORM WITH BACKEND - FIXED (Removed duplicate)
// ============================================
const contactForm = document.getElementById('contactForm');
const formMessage = document.getElementById('formMessage');

if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name')?.value.trim();
        const email = document.getElementById('email')?.value.trim();
        const message = document.getElementById('message')?.value.trim();
        
        if (!name || !email || !message) {
            showFormMessage('❌ Please fill all fields', '#ff6b6b');
            return;
        }
        
        // Show loading
        const submitBtn = contactForm.querySelector('button');
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';
        submitBtn.disabled = true;
        
        try {
            // Try to send to backend
            const response = await fetch(`${API_BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email, message })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                showFormMessage('✅ Message sent! I\'ll get back to you soon.', '#4a9eff');
                contactForm.reset();
                
                // Also save to localStorage
                saveMessageToLocal(name, email, message);
            } else {
                throw new Error(data.message || 'Server error');
            }
        } catch (error) {
            console.error('Backend error:', error);
            // Fallback: Save locally
            saveMessageToLocal(name, email, message);
            showFormMessage('✅ Message saved locally! I\'ll get back to you soon.', '#4a9eff');
        } finally {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            setTimeout(() => {
                if (formMessage) formMessage.innerHTML = '';
            }, 500);
        }
    });
}

function showFormMessage(msg, color) {
    if (formMessage) {
        formMessage.innerHTML = `<span style="color: ${color};">${msg}</span>`;
    }
}

function saveMessageToLocal(name, email, message) {
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push({ name, email, message, date: new Date().toISOString() });
    localStorage.setItem('contactMessages', JSON.stringify(messages));
}

// ============================================
// PROJECTS WITH BACKEND
// ============================================
const projectsData = {
    local: [
        {
            id: 1,
            title: "Restaurant Website",
            shortDesc: "Restaurant Website built with HTML, CSS, and JavaScript featuring responsive design and full-stack functionality.",
            fullDesc: "Complete restaurant website with menu management, online ordering, and reservation system. Built with modern web technologies for a seamless user experience.",
            tech: ["HTML", "CSS", "JavaScript", "MongoDB",, "Node.js", "Express"],
            image: "https://t4.ftcdn.net/jpg/02/94/26/33/360_F_294263329_1IgvqNgDbhmQNgDxkhlW433uOFuIDar4.jpg",
            liveLink: "https://github.com/Santosh803307/Restaurant-Website"
        },
        {
            id: 2,
            title: "Amazon Clone",
            shortDesc: "Amazon Clone created with HTML and CSS showcasing responsive design and e-commerce UI layout.",
            fullDesc: "Amazon Clone built with HTML and CSS, featuring a responsive design and e-commerce UI layout. This project demonstrates front-end development skills and attention to detail in replicating a popular website's look and feel.",
            tech: ["index.html", "style.css"],
            image: "https://i.ytimg.com/vi/Qo84sV_6THY/maxresdefault.jpg",
            liveLink: "https://github.com/Santosh803307/Amazon-Clone"
        },
        {
            id: 3,
            title: "Portfolio Website",
            shortDesc: "Developed a personal Portfolio Website using HTML, CSS, JavaScript, and backend technologies, featuring modern UI/UX design, responsive layout, and a functional contact form with email integration using Node.js/API.",
            fullDesc: "Personal Portfolio Website showcasing my projects, skills, and experience. Built with a modern design and responsive layout, it includes a functional contact form that integrates with a Node.js backend to send emails. This project highlights my full-stack development capabilities and attention to detail in creating an engaging online presence.",
            tech: ["HTML", "CSS", "JavaScript", "Node.js", "Express", "MongoDB"],
            image: "Portfolio.jpeg",
            liveLink: "https://github.com/Santosh803307/Portfolio-Website"
        }
    ]
};

async function loadProjects() {
    const projectsGrid = document.getElementById('projectsGrid');
    if (!projectsGrid) return;
    
    let projects = [];
    
    try {
        // Try to fetch from backend
        const response = await fetch(`${API_BASE_URL}/projects`);
        const data = await response.json();
        
        if (response.ok && data.success && data.projects && data.projects.length > 0) {
            projects = data.projects;
            console.log('✅ Loaded projects from backend');
        } else {
            throw new Error('No projects from backend');
        }
    } catch (error) {
        console.log('⚠️ Using local projects');
        projects = projectsData.local;
    }
    
    // Clear and render
    projectsGrid.innerHTML = '';
    projects.forEach((project, index) => {
        const card = createProjectCard(project, index);
        projectsGrid.appendChild(card);
    });
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = 'project-card';
    card.setAttribute('data-aos', 'fade-up');
    card.setAttribute('data-aos-delay', (index + 1) * 100);
    
    card.innerHTML = `
        <div class="project-image">
            <img src="${project.image}" alt="${project.title}" onerror="this.src="https://cdn.pixabay.com/photo/2016/02/10/13/35/hotel-1191718_1280.jpg">
            <div class="project-overlay">
                <button class="project-link view-detail" data-id="${project._id || project.id}">
                    <i class="fas fa-external-link-alt"></i>
                </button>
            </div>
        </div>
        <div class="project-info">
            <h3>${project.title}</h3>
            <p>${project.shortDesc || project.description || ''}</p>
            <div class="project-techs">
                ${(project.tech || []).map(tech => `<span>${tech}</span>`).join('')}
            </div>
        </div>
    `;
    
    const viewBtn = card.querySelector('.view-detail');
    if (viewBtn) {
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            openProjectModal(project);
        });
    }
    
    return card;
}

function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    if (!modal) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalTech = document.getElementById('modalTech');
    const modalFullDesc = document.getElementById('modalFullDesc');
    const modalLiveLink = document.getElementById('modalLiveLink');
    
    if (modalTitle) modalTitle.innerText = project.title;
    if (modalTech) modalTech.innerHTML = (project.tech || []).map(t => `<span>${t}</span>`).join('');
    if (modalFullDesc) modalFullDesc.innerText = project.fullDesc || project.description || 'No description available';
    if (modalLiveLink) modalLiveLink.href = project.liveLink || project.githubLink || '#';
    
    modal.style.display = 'flex';
}

// Close modal
const modalClose = document.querySelector('.modal-close');
if (modalClose) {
    modalClose.addEventListener('click', () => {
        const modal = document.getElementById('projectModal');
        if (modal) modal.style.display = 'none';
    });
}

window.addEventListener('click', (e) => {
    const modal = document.getElementById('projectModal');
    if (e.target === modal && modal) modal.style.display = 'none';
});

// ============================================
// PROGRESS BAR ANIMATION
// ============================================
const progressBars = document.querySelectorAll('.progress');
const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const width = bar.getAttribute('data-width');
            if (width) {
                bar.style.width = width + '%';
            }
            progressObserver.unobserve(bar);
        }
    });
}, { threshold: 0.5 });

progressBars.forEach(bar => {
    if (bar) progressObserver.observe(bar);
});

// ============================================
// STATS COUNTER - FIXED
// ============================================
const statNumbers = document.querySelectorAll('.stat-number');
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const element = entry.target;
            const targetText = element.textContent;
            const target = parseInt(targetText);
            
            if (!isNaN(target)) {
                let current = 0;
                const increment = target / 40;
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        element.textContent = target + (targetText.includes('+') ? '+' : '');
                        clearInterval(timer);
                    } else {
                        element.textContent = Math.floor(current) + (targetText.includes('+') ? '+' : '');
                    }
                }, 25);
            }
            statsObserver.unobserve(element);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    if (stat) statsObserver.observe(stat);
});

// ============================================
// PHOTO UPLOAD - FIXED
// ============================================
function uploadProfilePhoto() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (event) => {
                const heroImage = document.querySelector('#profilePhoto');
                const aboutImage = document.querySelector('.about-img-wrapper img');
                
                if (heroImage) heroImage.src = event.target.result;
                if (aboutImage) aboutImage.src = event.target.result;
                
                localStorage.setItem('profilePhoto', event.target.result);
            };
            
            reader.readAsDataURL(file);
        }
    };
    
    input.click();
}

const profilePhotoElement = document.querySelector('#profilePhoto');
if (profilePhotoElement) {
    profilePhotoElement.addEventListener('click', uploadProfilePhoto);
}

// ============================================
// PARALLAX EFFECT FOR HERO SECTION
// ============================================
const hero = document.querySelector('.hero');
if (hero) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        hero.style.backgroundPositionY = scrolled * 0.3 + 'px';
    });
}

// ============================================
// PROJECT CARDS HOVER EFFECT
// ============================================
const projectCards = document.querySelectorAll('.project-card');
projectCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// ============================================
// LOAD SAVED PHOTO AND INITIALIZE
// ============================================
window.addEventListener('DOMContentLoaded', () => {
    const savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
        const heroImage = document.querySelector('#profilePhoto');
        const aboutImage = document.querySelector('.about-img-wrapper img');
        
        if (heroImage) heroImage.src = savedPhoto;
        if (aboutImage) aboutImage.src = savedPhoto;
    }
    
    // Load projects
    loadProjects();
    
    // Check backend connection
    checkBackendStatus();
});

// Check backend connection
async function checkBackendStatus() {
    try {
        const response = await fetch(`${API_BASE_URL}/projects`);
        if (response.ok) {
            console.log('✅ Backend is connected and running');
        } else {
            console.log('⚠️ Backend returned error, using local data');
        }
    } catch (error) {
        console.log('⚠️ Backend not connected, using local data only');
    }
}