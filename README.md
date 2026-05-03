# Key Piano

|Title | Key Piano|
| :-- | :-- |
|Author | Sadrita Neogi|
|Platform | [Beest](https://beest.hackclub.com/)|

## [LIVE URL](https://key-piano-hackclub.vercel.app/)

#### This is an interactive web-based piano application that lets you play music using your computer keyboard or mouse. Perfect for fun and to spend time with your boring keyboard ...


---

## Tech Used
  |Tech Stack|
  |:--|
  | TypeScript |
  | JSON |
  |JavaScript|
  | CSS |
  |HTML|
  
---

Ai  - I have use ai to know how I can implement the octaves for the music.

---

### To Run Locally

1. **Clone the repository**
   ```bash
   https://github.com/Sadrita404/Key-Piano.git
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to start playing!


   ---

   ##  How to Use

### Basic Playing
1. **Use your keyboard**: Press Q, W, E, R, T, Y, U, I for a C major scale
2. **Click the piano**: Use your mouse to click virtual piano keys
3. **Adjust volume**: Use the volume slider to control audio level

   ---

   ### Keyboard Mapping Customization
1. Click **"Keyboard Settings"** button
2. **Set octaves** for each keyboard row:
   - QWERTY row → Choose base octave (1-7)
   - ASDF row → Choose base octave (1-7)
   - ZXCV row → Choose base octave (1-7)
3. **Preview mapping** - see exactly which keys play which notes
4. **Save settings** or reset to defaults

   ---

   ## Browser Support

- **Chrome/Chromium**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support

---

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

  ---

### Project Structure
```
src/
├── components/         
│   ├── Piano.tsx      
│   ├── MusicalScore.tsx 
│   ├── KeyboardSettings.tsx 
│   ├── KeyboardHint.tsx 
│   └── SampleSongs.tsx 
├── utils/              
│   ├── AudioEngine.ts 
│   └── noteMapping.ts  
├── data/               
│   └── sampleSongs.ts  
└── App.tsx          
```

---

## Adding New Songs (OF your Choice )

To add your own songs, edit `src/data/sampleSongs.ts`:

```typescript
export const sampleSongs = {
  "Your Song Name": {
    notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'],
    durations: [1, 1, 1, 1, 1, 1, 1, 2] // In beats
  }
};
```

--- 

## Poject Screenshot

<img width="1920" height="1080" alt="Key Piano" src="https://github.com/user-attachments/assets/ac7302e5-e580-4300-aaf8-1bd6028b4011" />





---

<img width="1439" height="716" alt="Screenshot 2026-05-03 at 12 07 51 PM" src="https://github.com/user-attachments/assets/29efabe3-5d28-442c-87a3-b96ccb31b16a" />


---

<img width="1442" height="718" alt="Screenshot 2026-05-03 at 12 08 07 PM" src="https://github.com/user-attachments/assets/9cda159d-87cd-4a01-a351-6fd9a79df592" />


---

<img width="1434" height="707" alt="Screenshot 2026-05-03 at 12 17 59 PM" src="https://github.com/user-attachments/assets/ad9d8268-20bf-4e5a-b8f4-4c086e8922bc" />


---

### For contributing to this project, first for the repo and add additional changes to make the website more good can you make a pull request I Will surely check that and merge it.

## Under Hack Club
<a href="https://hackclub.com/"><img style="position: absolute; top: 0; left: 10px; border: 0; width: 256px; z-index: 999;" src="https://assets.hackclub.com/flag-orpheus-left.svg" alt="Hack Club"/></a>


