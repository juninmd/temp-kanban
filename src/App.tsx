import { useState } from 'react';
import { HomeView } from './components/HomeView';
import { BoardView } from './components/BoardView';

function App() {
  const [currentBoardId, setCurrentBoardId] = useState<string | null>(null);

  if (currentBoardId) {
    return (
      <BoardView
        boardId={currentBoardId}
        onBack={() => setCurrentBoardId(null)}
      />
    );
  }

  return (
    <HomeView onSelectBoard={(id) => setCurrentBoardId(id)} />
  );
}

export default App;
