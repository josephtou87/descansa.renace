// Configuración de Redes Sociales para FC DESCANSA
// Actualiza estas URLs con las reales de tu equipo

const socialMediaConfig = {
    facebook: {
        url: 'https://facebook.com/fcdescansa',
        icon: 'fab fa-facebook-f',
        color: '#1877f2',
        name: 'Facebook'
    },
    instagram: {
        url: 'https://instagram.com/fcdescansa',
        icon: 'fab fa-instagram',
        color: '#e4405f',
        name: 'Instagram'
    },
    tiktok: {
        url: 'https://tiktok.com/@fcdescansa',
        icon: 'fab fa-tiktok',
        color: '#000000',
        name: 'TikTok'
    },
    youtube: {
        url: 'https://youtube.com/@fcdescansa',
        icon: 'fab fa-youtube',
        color: '#ff0000',
        name: 'YouTube'
    },
    twitter: {
        url: 'https://twitter.com/fcdescansa',
        icon: 'fab fa-twitter',
        color: '#1da1f2',
        name: 'Twitter'
    },
    whatsapp: {
        url: 'https://wa.me/521234567890',
        icon: 'fab fa-whatsapp',
        color: '#25d366',
        name: 'WhatsApp'
    }
};

// Función para actualizar enlaces de redes sociales
function updateSocialLinks() {
    const socialLinks = document.querySelectorAll('.social-link');
    
    socialLinks.forEach(link => {
        const platform = link.className.split(' ').find(cls => cls in socialMediaConfig);
        if (platform && socialMediaConfig[platform]) {
            const config = socialMediaConfig[platform];
            link.href = config.url;
            link.title = `Síguenos en ${config.name}`;
        }
    });
}

// Función para agregar nuevas redes sociales dinámicamente
function addSocialLink(platform, container) {
    if (!socialMediaConfig[platform]) return;
    
    const config = socialMediaConfig[platform];
    const link = document.createElement('a');
    link.href = config.url;
    link.className = `social-link ${platform}`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.title = `Síguenos en ${config.name}`;
    
    link.innerHTML = `
        <i class="${config.icon}"></i>
        <span>${config.name}</span>
    `;
    
    container.appendChild(link);
}

// Función para obtener estadísticas de redes sociales (placeholder)
function getSocialStats() {
    return {
        facebook: { followers: 1250, likes: 8900 },
        instagram: { followers: 2100, posts: 156 },
        tiktok: { followers: 850, videos: 45 },
        youtube: { subscribers: 420, videos: 23 }
    };
}

// Exportar configuración
window.SocialMediaConfig = socialMediaConfig;
window.updateSocialLinks = updateSocialLinks;
window.addSocialLink = addSocialLink;
window.getSocialStats = getSocialStats;
