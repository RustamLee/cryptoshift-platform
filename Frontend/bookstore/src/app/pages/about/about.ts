import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="about-page">
      <div class="about-inner">
        <main class="about-card">
          <header class="about-header">
            <div class="about-title">
              Librería E. Commerce
              <div class="about-logo-wrap">
                <picture>
                  <source srcset="/UTN-iso-new.png" />
                  <img src="/UTN-iso-new.png" alt="UTN MDP" class="about-logo" />
                </picture>
              </div>
            </div>
          </header>
          <div class="about-body">
            <p class="about-text">
              El proyecto llamado “API Librería E.Commerce” se encargará de mantener un registro de
              los libros, los usuarios y toda la información relacionada a las compras realizadas
              por medio del sistema. También permitirá la búsqueda y clasificación de libros junto
              con la realización de ABM de usuario, géneros de libros y perfiles vendedores por
              parte de los administradores. Es importante destacar que el sistema no lleva registros
              de los envíos o pagos realizados, ya que el manejo de estos quedarán relegados a APIs
              externas.
            </p>

            <div class="about-authors">
              <h3>Carrera:</h3>
              <p>Tecnicatura Universitaria en Programación</p>
            </div>

            <div class="about-authors">
              <h3>Materia:</h3>
              <p>Programación IV</p>
            </div>

            <div class="about-authors">
              <h3>Profesor:</h3>
              <p>Gabriel Chaldu</p>
            </div>

            <div class="about-authors">
              <h3>Integrantes:</h3>
              <p>Ezequiel Rodríguez Reding · Sebastián Roldán · Rustam Sagaddinov</p>
              <p>2025</p>
            </div>
          </div>
        </main>
      </div>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .about-page {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 3rem 1rem;
        background: var(--body-color);
      }

      .about-inner {
        width: 100%;
        max-width: 980px;
      }

      .about-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
      }

      .about-title {
        font-size: 1.6rem;
        text-align: center;
        flex: 1;
        font-weight: 600;
        color: var(--title-color);
      }

      .about-logo-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 1rem;
      }
      .about-logo {
        width: 120px;
        height: 120px;
        object-fit: contain;
      }

      :host-context(body.dark-theme) .about-logo {
        filter: invert(1) brightness(2) contrast(1.1) saturate(0);
      }

      .about-card {
        background: var(--container-color);
        border-radius: 10px;
        padding: 1.5rem;
        border: 1px solid var(--border-color);
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.04);
      }
      .about-body {
        max-width: 820px;
        margin: 0 auto;
        color: var(--text-color);
      }
      .about-text {
        white-space: pre-wrap;
        line-height: 1.5;
        margin: 0 0 1rem 0;
        color: var(--text-color);
      }

      .about-authors h3 {
        text-align: center;
        color: var(--title-color);
      }
      .about-authors p {
        text-align: center;
        font-weight: 600;
        color: var(--text-color);
        margin: 0 0 0.5rem 0;
      }

        .about-authors h3 {
          text-align: center;
          color: var(--title-color);
        }
      @media (max-width: 720px) {
        .about-header {
          flex-direction: column;
          align-items: center;
        }
        .about-title {
          order: 3;
        }
        .about-logo {
          width: 90px;
          height: 90px;
        }
      }
    `,
  ],
})
export class AboutComponent {}
