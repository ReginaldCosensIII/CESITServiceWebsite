# CESRebuild Website

This is the official redevelopment project for the CES (Computer Enhancement Services Inc.) website. The project includes a modern static **frontend** and a functional **ASP.NET Core backend** to handle form submissions (such as the "Contact Us" form), all designed to be deployed on an **IIS server** environment.

---

## 📁 Project Structure

```text
CESRebuild/
├── Front-End/                  # All HTML, CSS, and client-side assets
│   ├── index.html
│   ├── contact.html
│   ├── css/
│   ├── js/
│   └── images/
│
├── Contact-Form-Backend/      # Published ASP.NET Core backend
│   ├── CESRebuildContactFormBackend.dll
│   ├── web.config
│   ├── wwwroot/               # Contains placeholder static files
│   └── ...                    # Other compiled & runtime backend files
│
├── vercel.json                # Vercel deployment config (points to Front-End)
└── README.md                  # Project documentation (this file)
```

---

## 🚀 Deployment Targets

### Vercel (Frontend Only)
- Purpose: Public stakeholder preview
- Output Directory: `Front-End/`

### Local IIS Deployment (Frontend + Backend)
- **Front-End**: Hosted as the root web app
- **Backend**: Published ASP.NET Core app deployed as a sub-application (`/CESBackend`) under IIS

---

## 🔧 Technologies Used

- **Frontend**: HTML5, CSS3, JS (vanilla)
- **Backend**: ASP.NET Core (.NET 8)
- **Server**: IIS (Internet Information Services)
- **Deployment Tools**: Visual Studio Community, Visual Studio Code, Vercel CLI

---

## 💡 Development Notes

- The backend project was built in Visual Studio, published, and integrated as a sub-app in IIS.
- Contact form submissions are routed to: `/CESBackend/api/contact`
- Email handling is simulated during development; SMTP integration to follow once credentials and server access are confirmed.
- Codebase is documented and version-controlled through GitHub.

---

## 📌 Branching Strategy

- `main`: Stable production-ready code
- `contact-form-integration`: Feature branch for integrating and testing backend form submission
- Additional feature branches to be created for new sections or backend expansion.

---

## 🧪 Testing

- Both the frontend and backend are actively tested locally through IIS before being pushed to the dev server.
- Form endpoints are tested for proper response handling and JSON validation.
- Vercel deployment is continuously validated to ensure stakeholder access to the latest version.

---

## 🗂️ To-Do / Short Teerm Plans

- [ ] **Finalize ASP.NET Core backend**
  - Ensure form submission logic is stable and secure.
  - Add email simulation with placeholder SMTP settings.
  - Document backend behavior for future SMTP integration.
  
- [ ] **Complete IIS Integration**
  - Test backend endpoint (`/api/contact`) via frontend form.
  - Verify proper sub-application setup under the main IIS site.
  - Confirm contact form works across browsers (Chrome cache issue resolved).

- [ ] **Sync Project with Dev Server**
  - Move final `Front-End/` and `Contact-Form-Backend/` directories to the dev server.
  - Mirror tested IIS setup locally onto the dev environment.

- [ ] **Repository Enhancements**
  - Ensure `.gitignore` covers build artifacts and system files.
  - Add comments and documentation to backend source files
  - Organize project structure clearly (especially with long-term goals in mind).
  
- [ ] **Backend Source Code (future phase)**
  - Store backend **source** code in a separate repo or private subfolder.
  - Plan future build/deploy automation (optional).

- [ ] **Stakeholder Review**
  - Notify Mr. Robertson once frontend/backend are deployed on Dev Server.
  - Provide simple demo and instructions for testing the contact form.

- [ ] **Future Planning**
  - Determine long-term tech stack direction (stay with .NET Core or explore alternatives).
  - Plan URL rewrite implementation for SEO-friendly routes.
  - Clarify project timeline, content finalization, and page priorities.


