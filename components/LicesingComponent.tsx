"use client";

import React from "react";

export default function LicesingComponent() {
  return (
    <div className="mx-auto max-w-5xl rounded-md p-4 shadow-md dark:text-gray-200">
      <h1 className="mb-4 text-xl font-semibold">
        Licencia de Código Abierto - ContaTools React Component
      </h1>
      <section className="mb-4">
        <h2 className="font-semibold">1. Licencia</h2>
        <p>
          Este componente React está bajo la{" "}
          <strong>Licencia de Código Abierto [Nombre de la Licencia]</strong>.
          Puedes consultar los detalles completos de esta licencia en el archivo
          de licencia del repositorio.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">2. Uso Libre y Abierto</h2>
        <p>
          Puedes usar, modificar y distribuir este componente React para fines{" "}
          <strong>personales</strong>, <strong>educativos</strong> y
          <strong>no comerciales</strong> bajo los términos establecidos en la
          presente licencia. Las funcionalidades de este componente React, como
          la integración con las herramientas de cotización, cálculo del salario
          diario integrado, devolución de recursos y contador de dinero, están
          disponibles para su uso libre y abierto.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">3. Restricciones y Cobros Futuros</h2>
        <p>
          Aunque este componente React está bajo una licencia de código abierto,
          ciertas funcionalidades avanzadas, mejoras o soporte adicional pueden
          estar sujetas a <strong>cargos adicionales</strong> o{" "}
          <strong>restricciones</strong> en el futuro. El desarrollador se
          reserva el derecho de introducir tarifas, restricciones y cambios en
          las condiciones de uso con previo aviso a los usuarios.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">4. Modificación del Código</h2>
        <p>
          Estás autorizado a <strong>modificar</strong> el código fuente de este
          componente React, siempre y cuando:
        </p>
        <ul className="ml-6 list-disc">
          <li>
            No modifiques ni elimines las{" "}
            <strong>notificaciones de derechos de autor</strong> y la
            información de la licencia original.
          </li>
          <li>
            No uses el código modificado de manera que infrinja las
            restricciones legales aplicables.
          </li>
        </ul>
        <p>
          Si decides distribuir el código modificado, deberás hacerlo bajo los
          mismos términos de esta licencia.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">5. Uso Comercial</h2>
        <p>
          El uso comercial de este componente React estará{" "}
          <strong>sujeto a una licencia adicional</strong> que podrás obtener
          poniéndote en contacto con el desarrollador. Esto incluye, pero no se
          limita a, la distribución del componente como parte de productos o
          servicios comerciales.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">6. Propiedad Intelectual</h2>
        <p>
          Todos los derechos de propiedad intelectual sobre este componente
          React y su código fuente pertenecen a <strong>TresA Design</strong>.
          Esta licencia no te otorga ningún derecho sobre las marcas, logotipos
          o nombres asociados con este componente.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">7. Descargo de Responsabilidad</h2>
        <p>
          Este componente React se proporciona{" "}
          <strong>&quot;tal cual&quot;</strong>, sin ninguna garantía expresa o
          implícita de ningún tipo, incluyendo pero no limitado a la garantía de
          comerciabilidad o idoneidad para un propósito particular. El autor no
          será responsable de ningún daño derivado del uso de este componente.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">8. Contactar al Desarrollador</h2>
        <p>
          Si tienes preguntas sobre esta licencia, deseas obtener una licencia
          comercial o necesitas soporte adicional, puedes{" "}
          <strong>contactar a TresA Design</strong> a través de{" "}
          <a
            href="https://tresa-design.vercel.app"
            className="text-blue-600 hover:underline dark:text-blue-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            nuestro sitio web
          </a>
          .
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-semibold">9. Términos de la Licencia</h2>
        <p>
          Este componente React puede estar sujeto a cambios en los términos de
          la licencia en el futuro. Las modificaciones se anunciarán
          adecuadamente y se proporcionarán instrucciones claras para obtener
          nuevas versiones del componente bajo los términos de licencia
          actualizados.
        </p>
      </section>

      <footer className="mt-8 border-t border-gray-300 pt-4 text-center text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
        <p>
          © {new Date().getFullYear()} <strong>TresA Design</strong> - Todos
          los derechos reservados.
        </p>
        <p className="mt-1">
          ContaTools - Herramientas Contables Profesionales
        </p>
      </footer>
    </div>
  );
}
