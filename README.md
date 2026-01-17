
# PesaDB - Browser-Native Relational Database Management System

A lightweight, fully functional relational database engine built entirely in TypeScript, running directly in the browser. No backend required.

Built with inspiration from modern database architectures and AI-assisted development workflows using Claude AI and AI Studio.

## Features

- ✅ **Full SQL Support** - SELECT, INSERT, UPDATE, DELETE with WHERE clauses
- ✅ **JOIN Operations** - INNER JOIN with relational integrity
- ✅ **Schema Management** - CREATE TABLE with constraints (PRIMARY KEY, UNIQUE, NOT NULL)
- ✅ **Visual Table Explorer** - CRUD operations without writing SQL
- ✅ **Transaction Ledger** - Real-time JOIN query demonstration
- ✅ **Browser Storage** - Persistent data using localStorage
- ✅ **TypeScript** - Type-safe implementation throughout

## Live Demo

Experience PesaDB in action with our interactive demo featuring:
- Merchant management system
- Transaction processing
- Real-time ledger with JOIN queries
- Visual database explorer

## Run Locally

**Prerequisites:** Node.js (v16 or higher)

1. **Clone the repository:**
```bash
   git clone <your-repo-url>
   cd pesadb
```

2. **Install dependencies:**
```bash
   npm install
```

3. **Run the development server:**
```bash
   npm run dev
```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## Project Structure
```
.
├── index.html                # Entry point & Tailwind/Fonts setup
├── index.tsx                 # React mounting logic
├── App.tsx                   # Main state & Tab navigation
├── types.ts                  # Shared SQL & Database type definitions
├── metadata.json             # App metadata
├── rdbms/                    # The Custom SQL Engine
│   ├── database.ts           # Main PesaDB API & AI Context Helper
│   └── core/
│       ├── storage.ts        # LocalStorage persistence layer
│       ├── parser.ts         # SQL String to Object Plan parser
│       └── executor.ts       # Query execution & JOIN logic
├── components/               # UI Components
│   ├── Layout.tsx            # App shell & Sidebar
│   ├── DemoApp.tsx           # M-Pesa Simulator & Merchant UI
│   ├── SQLRepl.tsx           # Terminal & AI Assistant interface
│   ├── TableExplorer.tsx     # Direct data & schema browser
│   └── ArchitectureDocs.tsx  # System documentation
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
└── vite.config.ts            # Build tool configuration

## Usage Examples

### SQL Queries
```typescript
// Create a table
PesaDB.query(`
  CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE
  )
`);

// Insert data
PesaDB.query(`
  INSERT INTO users (id, name, email) 
  VALUES (1, 'John Doe', 'john@example.com')
`);

// Query with JOIN
PesaDB.query(`
  SELECT transactions.id, users.name, transactions.amount 
  FROM transactions 
  JOIN users ON transactions.user_id = users.id
`);
```

### Visual Interface
Use the Table Explorer to:
- Browse all tables in the catalog
- Add/Edit/Delete records with forms
- View schema definitions
- No SQL knowledge required!

## Tech Stack

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Vite** - Build tool

## Development Notes

This project was developed with AI assistance from:
- **Claude AI** (Anthropic) - Code architecture and implementation
- **AI Studio** - Initial prototyping and design patterns

The RDBMS engine implements core relational database concepts including:
- B-tree-like indexing for primary keys
- Query optimization for JOIN operations
- ACID-compliant transaction handling (in-memory)
- Schema validation and constraint enforcement

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## License

MIT License - See [LICENSE](LICENSE) for details

## Acknowledgments

- Built as a demonstration of browser-native database capabilities
- Inspired by SQLite architecture
- Developed with AI-assisted workflows ai studio and claude
I used Claude AI to:
- Generate initial project structure
- Review code for best practices
- Debug complex issues
- Improve documentation clarity
---

**Note:** PesaDB is a demo project for educational purposes and job interviews. For production applications, use established database solutions.