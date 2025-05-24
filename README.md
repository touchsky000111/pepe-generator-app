# Peplicator

## Overview
 
This project is a monorepo leveraging Next.js, Vercel, Turborepo, React and pnpm. It consists of two main applications - a generator for creating unique Pepe NFTs and a website for minting them – as well as a shared TypeScript configuration.

### Applications

- `generator`: Generates unique images for the NFT collection.
- `website`: A minting platform for the NFT collection.

### Shared Packages

- `tsconfig`: Provides a reusable tsconfig.json configuration to ensure consistent TypeScript compilation across the project.

## Prerequisites

         
- Node 20+ 
- pnpm 8+

## Installation
 
1. Clone the repository:

```bash
git clone https://github.com/thelaplage/pepe-generator-main.git
```

2. Navigate to the project directory:

```bash
cd pepe-generator
```

3. Install dependencies using pnpm:

```bash
pnpm install
```

## Running the Project

To run the generator and website locally:

1. Start the development server for the website:

```bash
pnpm run dev --filter website
```

2. To use the generator, run:

```bash
pnpm run dev --filter generate
```
