"use client";

import { SiNextdotjs, SiPostgresql, SiRender } from "react-icons/si";
import { FaUserShield } from "react-icons/fa";

export default function TechStacks() {
  return (
    <div className="techstack-wrapper" style={{"margin": "10px" }}>
        {/* Next.js */}
          <a
            href="https://nextjs.org"
            target="_blank"
            aria-label="Next.js"
            data-social="nextjs"
            className="link"
          >
            <SiNextdotjs size={42} />
          </a>
          <div className="tooltip"></div>

        {/* PostgreSQL */}
          <a
            href="https://www.postgresql.org"
            target="_blank"
            aria-label="PostgreSQL"
            data-social="postgres"
            className="link"
          >
            <SiPostgresql size={42} />
          </a>
          <div className="tooltip"></div>

        {/* Render */}
          <a
            href="https://render.com"
            target="_blank"
            aria-label="Render"
            data-social="render"
            className="link"
          >
            <SiRender size={42} />
          </a>
          <div className="tooltip"></div>

        {/* Clerk */}
          <a
            href="https://clerk.com"
            target="_blank"
            aria-label="Clerk"
            data-social="clerk"
            className="link"
          >
            <FaUserShield size={42} />
          </a>
          <div className="tooltip"></div>
    </div>
  );
}
