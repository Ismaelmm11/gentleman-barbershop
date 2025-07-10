// src/pages/HomePage.tsx
import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; // Para el botón de reserva si va a /reservar-cita
import '../index.css'; // Asegúrate de importar tus estilos globales y variables CSS

export const HomePage: React.FC = () => {
  // Referencias para los elementos que queremos observar
  const animateRefs = useRef<(HTMLElement | null)[]>([]);
  const invisibleRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains('animate')) {
            entry.target.classList.add('visible');
          }
          if (entry.target.classList.contains('invisible')) {
            // Asumo que 'no' significa 'visible' o el estado final deseado.
            // Si 'invisible' es solo un estado inicial y 'visible' es el final,
            // podemos simplemente añadir 'visible' y gestionar la transición.
            entry.target.classList.remove('invisible'); // Quitar la clase invisible
            entry.target.classList.add('visible'); // O la clase final que haga el elemento visible
          }
          observer.unobserve(entry.target); // Dejar de observar una vez que es visible
        }
      });
    }, { threshold: 0.1 }); // Se activa cuando el 10% del elemento es visible

    // Observar todos los elementos con la clase 'animate'
    animateRefs.current.forEach(element => {
      if (element) observer.observe(element);
    });

    // Observar todos los elementos con la clase 'invisible'
    invisibleRefs.current.forEach(element => {
      if (element) observer.observe(element);
    });

    // Limpieza: desconectar el observer cuando el componente se desmonte
    return () => observer.disconnect();
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

  // Helper para asignar refs dinámicamente
  const setAnimateRef = (el: HTMLElement | null) => {
    if (el && !animateRefs.current.includes(el)) {
      animateRefs.current.push(el);
    }
  };

  const setInvisibleRef = (el: HTMLElement | null) => {
    if (el && !invisibleRefs.current.includes(el)) {
      invisibleRefs.current.push(el);
    }
  };


  return (
    <div className="home-page-container">
      {/* Banner Principal */}
      <section className="banner">
        <div className="banner-content">
          <div className="banner-image" >
            {/*<img src="/banner/banner.jpg" alt="Hombre con barba bien cuidada" />*/}
          </div>
          <div className='container-banner'>
            <div className="banner-text">
              <p className="banner-subtitle">Desde 2015 dando lo mejor de nosotros</p>
              <h1 className="banner-title">
                <span>HUMILDAD</span>
                <span>ESTILO</span>
                <span>Y BUEN ROLLO</span>
              </h1>
              {/* Enlazar al sistema de citas */}
              <Link to="/reservar-cita" className="btn"><span>RESERVA AHORA</span></Link>
            </div></div>

        </div>
        <svg style={{ marginBottom: '-80px', width: '200%' }} xmlns="http://www.w3.org/2000/svg" viewBox="20 0 1150 100" preserveAspectRatio="none">
          <g transform="translate(0, 100) scale(1, -1)">
            <path fill="#F5E9D4" className="elementor-shape-fill" opacity="0.33" d="M567.6,40.38 c-244.68,52.98 -315.72,-20.4 -384.36,0 C79.2,71.46 0,35.82 0,35.82 V0 h1200 v35.82 c0,0 -74.52,15.66 -113.88,17.58 c-39.36,1.98 -75.36,-7.38 -90.96,-13.26 C967.2,29.76 894.36,5.22 833.88,2.82 S590.88,35.4 567.6,40.38z"></path>
            <path fill="#F5E9D4" className="elementor-shape-fill" opacity="0.66" d="M880.8,40.38 c-54.6,0 -92.64,-13.92 -154.92,-23.46 c-34.32,-5.22 -180.36,-6.06 -304.8,23.46 s-110.04,-20.64 -179.04,0 C138.84,70.98 0,23.88 0,23.88 V0 h1200 v21.9 c0,0 -33.84,-11.1 -110.52,-11.1 C972.24,10.86 930.84,40.38 880.8,40.38z"></path>
            <path fill="#F5E9D4" className="elementor-shape-fill" d="M919.32,17.34 c-240,-34.5 -319.2,39.3 -474.12,11.7 C290.4,1.08 290.4,3.24 221.76,12.36 C153.6,21.48 158.76,26.94 107.88,31.5 C34.32,38.22 0,0 0,0 h1200 c0,0 -11.88,24.54 -100.32,28.86 S995.52,28.2 919.32,17.34z"></path>
          </g>
        </svg>
      </section>

      {/* Sección de GIFs */}
      <section className="gifs-section">
        <div className="container">
          <div className="gifs-container">
            <div className="gif-block animate" ref={setAnimateRef}>
              <div className="gif-placeholder">
                <img src="/gifs/afeitar.gif" alt="Cortes con precisión y estilo" /> {/* <-- Añade esta línea */}
              </div>
              <h3 className="gif-caption">CORTES CON PRECISIÓN Y ESTILO</h3>
            </div>
            <div className="gif-block animate delay-1" ref={setAnimateRef}>
              <div className="gif-placeholder">
                <img src="gifs/cuchilla.gif" alt="Experiencia única en elda" /> {/* <-- Añade esta línea */}
              </div>
              <h3 className="gif-caption">EXPERIENCIA ÚNICA EN ELDA</h3>
            </div>
            <div className="gif-block animate delay-2" ref={setAnimateRef}>
              <div className="gif-placeholder">
                <img src="gifs/amistad.gif" alt="Atención que te hace sentir en casa" /> {/* <-- Añade esta línea */}
              </div>
              <h3 className="gif-caption">ATENCIÓN QUE TE HACE SENTIR EN CASA</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Onda de nube */}
      <div>
        <svg className="nube" viewBox="0 0 283.5 27.8" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
          <rect width="100%" height="100%" fill="#FAF4E8" />
          <path fill="#F5E9D4" d="M0 0v6.7c1.9-.8 4.7-1.4 8.5-1 9.5 1.1 11.1 6 11.1 6s2.1-.7 4.3-.2c2.1.5 2.8 2.6 2.8 2.6s.2-.5 1.4-.7c1.2-.2 1.7.2 1.7.2s0-2.1 1.9-2.8c1.9-.7 3.6.7 3.6.7s.7-2.9 3.1-4.1 4.7 0 4.7 0 1.2-.5 2.4 0 1.7 1.4 1.7 1.4h1.4c.7 0 1.2.7 1.2.7s.8-1.8 4-2.2c3.5-.4 5.3 2.4 6.2 4.4.4-.4 1-.7 1.8-.9 2.8-.7 4 .7 4 .7s1.7-5 11.1-6c9.5-1.1 12.3 3.9 12.3 3.9s1.2-4.8 5.7-5.7c4.5-.9 6.8 1.8 6.8 1.8s.6-.6 1.5-.9c.9-.2 1.9-.2 1.9-.2s5.2-6.4 12.6-3.3c7.3 3.1 4.7 9 4.7 9s1.9-.9 4 0 2.8 2.4 2.8 2.4 1.9-1.2 4.5-1.2 4.3 1.2 4.3 1.2.2-1 1.4-1.7 2.1-.7 2.1-.7-.5-3.1 2.1-5.5 5.7-1.4 5.7-1.4 1.5-2.3 4.2-1.1c2.7 1.2 1.7 5.2 1.7 5.2s.3-.1 1.3.5c.5.4.8.8.9 1.1.5-1.4 2.4-5.8 8.4-4 7.1 2.1 3.5 8.9 3.5 8.9s.8-.4 2 0 1.1 1.1 1.1 1.1 1.1-1.1 2.3-1.1 2.1.5 2.1.5 1.9-3.6 6.2-1.2 1.9 6.4 1.9 6.4 2.6-2.4 7.4 0c3.4 1.7 3.9 4.9 3.9 4.9s3.3-6.9 10.4-7.9 11.5 2.6 11.5 2.6.8 0 1.2.2c.4.2.9.9.9.9s4.4-3.1 8.3.2c1.9 1.7 1.5 5 1.5 5s.3-1.1 1.6-1.4c1.3-.3 2.3.2 2.3.2s-.1-1.2.5-1.9 1.9-.9 1.9-.9-4.7-9.3 4.4-13.4c5.6-2.5 9.2.9 9.2.9s5-6.2 15.9-6.2 16.1 8.1 16.1 8.1.7-.2 1.6-.4V0H0z" />
        </svg>
      </div>

      {/* Sección de Servicios */}
      <section className="services-section">
        <div className="container">
          <h2 className="section-title animate" ref={setAnimateRef}>NUESTROS SERVICIOS</h2>
          <div className="services-container">
            <div className="service-card invisible" ref={setInvisibleRef}>
              <div className="service-card-inner animate" ref={setAnimateRef}>
                <div className="service-image" data-service="Micropigmentación"></div>
                <div className="service-content">
                  <h3 className="service-title">Micropigmentación</h3>
                  <p className="service-description">Realza tus facciones con técnicas avanzadas de micropigmentación capilar y facial</p>
                  <a href="" className="btn"><span>Saber más</span></a>
                </div>
              </div>
            </div>
            <div className="service-card invisible" ref={setInvisibleRef}>
              <div className="service-card-inner animate delay-1" ref={setAnimateRef}>
                <div className="service-image" data-service="Barbería"></div>
                <div className="service-content">
                  <h3 className="service-title">Barbería</h3>
                  <p className="service-description">Cortes clásicos y modernos, arreglo de barba y tratamientos capilares de primera calidad</p>
                  <a href="#" className="btn"><span>Saber más</span></a>
                </div>
              </div>
            </div>
            <div className="service-card invisible" ref={setInvisibleRef}>
              <div className="service-card-inner animate delay-2" ref={setAnimateRef}>
                <div className="service-image" data-service="Tatuajes"></div>
                <div className="service-content">
                  <h3 className="service-title">Tatuajes</h3>
                  <p className="service-description">Arte corporal personalizado por artistas experimentados en diversos estilos</p>
                  <a href="#" className="btn"><span>Saber más</span></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Bloques Informativos */}
      <section className="info-section">
        <div className="container" style={{ display: 'flex', alignItems: 'center' }}>
          <div className="info-blocks">
            <div className="info-block animate" ref={setAnimateRef}>
              <div className="block-content">
                <div className="block-image">
                  <img src="img/team.png" alt="Nuestro equipo" />
                </div>
                <div className="block-text">
                  <h3 className="block-title">NUESTRO EQUIPO</h3>
                  <p className="block-description">Profesionales apasionados por su trabajo, con años de experiencia y formación continua para ofrecerte lo mejor</p>
                  <a href="#" className="btn ancho50"><span>Ver más</span></a>
                </div>
              </div>
            </div>
            <div className="info-block animate delay-1" ref={setAnimateRef}>
              <div className="block-content">
                <div className="block-text">
                  <h3 className="block-title">GALERÍA</h3>
                  <p className="block-description">Descubre nuestros mejores trabajos y el ambiente único de Gentleman's Barbershop</p>
                  <div className="gallery-grid">
                    {/* Aquí pones tus imágenes */}
                    <div className="gallery-item">
                      <img src="img/corte1.jpg" alt="Descripción de imagen 1" />
                    </div>
                    <div className="gallery-item">
                      <img src="img/corte2.jpg" alt="Descripción de imagen 2" />
                    </div>
                    <div className="gallery-item">
                      <img src="img/corte3.jpg" alt="Descripción de imagen 3" />
                    </div>
                    <div className="gallery-item">
                      <img src="img/corte4.jpg" alt="Descripción de imagen 4" />
                    </div>
                  </div>
                  <a href="#" className="btn ancho50"><span>Ver más</span></a>
                </div>
              </div>
            </div>
            <div className="info-block animate delay-2" ref={setAnimateRef}>
              <div className="block-content">
                <div className="block-image">
                  <img src="img/Pack.png" alt="Productos de barbería" />
                </div>
                <div className="block-text">
                  <h3 className="block-title">TIENDA</h3>
                  <p className="block-description">Productos profesionales para el cuidado de barba y cabello. Lo que usamos en nuestra barbería, disponible para ti</p>
                  <a href="#" className="btn ancho50"><span>Ver más</span></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};