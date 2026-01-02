# Organizer – School project

Organizer is a web-based application developed as a final degree project in Frontend Development. The application brings together todos, checklists, notes, and calendar activities in a single, unified interface and is built using modern web technologies.

The project is developed as a minimum viable product (MVP) with a strong focus on structure, accessibility, and a scalable architecture that allows for future expansion.

## 🔗 Deployed Application

👉 Live demo:  
https://organizer-examensarbete.vercel.app/

Authentication is required to use the application.  
You can register a new account directly in the application.


## ▶️ Running the project locally

### 1. Clone the repository
```bash
git clone https://github.com/YOUR-USERNAME/organizer.git
cd organizer
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
Create a .env file in the project root and add the following:

⚠️ Note:  
The environment variables below are examples only.  
Never commit real secrets or credentials to the repository.

DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000


### 4. Database & Prisma
```bash
npx prisma migrate dev
npx prisma db seed
```

### 5. Start the dev server
```bash
npm run dev
```

The application will now be available at:
http://localhost:3000

🧠 Tech Stack

Framework: Next.js (React + TypeScript)

Styling: Tailwind CSS, shadcn/ui

Database: PostgreSQL

ORM: Prisma

Authentication: NextAuth

Hosting: Vercel

Design & prototyping: Figma

Version control: Git & GitHub


-------------------------------------------------------------------------------------------------------

CHECKLISTA – BETYGSKRITERIER (EXAMENSARBETE)

GODKÄNT (G)

Planering och research
X Jag har genomfört en noggrann målgruppsanalys och identifierat användarnas behov.
X Jag har använt ett projekthanteringsverktyg (GitHub Projects) med backlog och Kanban-struktur för att planera och följa projektets utveckling.

Design och prototyping
X Jag har skapat lofi-wireframes i Figma som visar applikationens struktur och flöden.
X Jag har skapat en interaktiv prototyp i Figma som följer grundläggande UX/UI-principer.
X Designen är responsiv och anpassad för minst två skärmstorlekar (mobil och desktop).
X Designen tar hänsyn till tillgänglighet enligt WCAG 2.1 (kontrast, läsbarhet och tydlig navigation).

Applikationsutveckling
X Projektet är utvecklat med ett modernt JavaScript-ramverk (Next.js med React och TypeScript).
X Jag använder en databas för att lagra och hämta data (PostgreSQL via Supabase).
X Jag har implementerat state-hantering för att hantera och uppdatera applikationens data på ett organiserat sätt.
X Applikationen innehåller dynamiska och interaktiva komponenter med reaktivt beteende.
X Jag använder semantisk HTML (HTML5) i projektet.
X Koden och användargränssnittet följer WCAG 2.1 i tillämpliga delar.
X Appikationen är testad i WebAIM WAVE.
X Webapplikationen är responsiv och fungerar korrekt på både mobil och desktop.

README
X README innehåller tydliga instruktioner för hur projektet körs lokalt.
X README innehåller länk till den deployade versionen av applikationen.
X README innehåller en checklista där uppfyllda G- och VG-krav är ibockade.

Versionshantering
X Projektet är versionshanterat med Git och ligger i ett publikt GitHub-repo.
X Git har använts kontinuerligt under hela projektets gång.

Deploy
X Projektet är deployat och publikt tillgängligt via Vercel.

Helhetsupplevelse
X Applikationen är fri från tekniska fel som döda länkar eller kraschande sidor.
X Designen är konsekvent genom hela applikationen.
X Navigationen är sammanhängande och ger en obruten användarupplevelse.

VÄL GODKÄNT (VG)

Design och prototyping
X Prototypen i Figma innehåller interaktivitet som tydligt visar användarflöden.
X Prototypen är mycket lik den färdiga produkten.
X Designen följer WCAG 2.1 nivå A och AA.

Applikationsutveckling
X Jag använder en tydlig struktur för state-hantering och global state där det är relevant.
X Koden följer WCAG 2.1 nivå A och AA.
X Tillgänglighet har kontrollerats och testats enligt vedertagna riktlinjer.
X Applikationen är optimerad genom återanvändbara komponenter och effektiv kodstruktur.
X CRUD-operationer (Create, Read, Update, Delete) är implementerade med säker hantering av användardata.
X Säker autentisering är implementerad för att skydda användardata och begränsa åtkomst till behöriga användare.
X Applikationen är fullt responsiv och anpassar sig dynamiskt till olika skärmstorlekar.

README (VG)
- README beskriver inte bara hur projektet körs utan även tekniska val och hur centrala funktioner är implementerade.

Versionshantering (VG)
- Arbetet har skett med feature branches.
- Pull requests har använts innan merge till huvudbranch.
X Commit-historiken är tydlig och väl dokumenterad med informativa commit-meddelanden.

Deploy (VG)
X Projektet har ett automatiserat bygge- och deployflöde via GitHub och Vercel.

Slutrapport (VG)
X Slutrapporten är 3–6 A4-sidor och innehåller en djupgående analys av arbetsprocessen.
X Rapporten beskriver tekniska och designrelaterade hinder samt hur dessa lösts.
- Tekniska val är tydligt motiverade och jämförda med alternativa lösningar.
- UX/UI- och tillgänglighetsbeslut är förklarade och kopplade till användarupplevelsen.

Helhetsupplevelse (VG)
X Applikationen erbjuder en professionell och optimerad användarupplevelse.
X Laddningstider är korta och feedback ges vid användarinteraktioner.
X Applikationen är testad för enhetlig funktion och design på flera enheter och webbläsare.