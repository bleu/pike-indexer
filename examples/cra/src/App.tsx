import './App.css';
import { PTokenListPage } from './pages/pTokensList';
import { UserMetricsPage } from './pages/userMetrics';
import { FC, useEffect, useState } from 'react';
import { useWeb3Info } from './hooks/useWeb3Info';
import { ChainIdContext } from './context';

const EXAMPLES: ExampleProps[] = [
  { title: 'pToken List', Component: PTokenListPage },
  { title: 'user Metrics', Component: UserMetricsPage },
];

interface ExampleProps {
  title: string;
  Component: FC;
  open?: boolean;
}

function Example({ open = false, title, Component }: ExampleProps) {
  const [isOpen, setIsOpen] = useState(open);

  return (
    <div key={title} className="section">
      <div onClick={() => setIsOpen(state => !state)}>{title}</div>
      <div className={isOpen ? 'open' : ''}>
        <Component />
      </div>
    </div>
  );
}

function App() {
  const { chainId } = useWeb3Info();
  const [currentChainId, setCurrentChainId] = useState(chainId);

  useEffect(() => {
    setCurrentChainId(chainId);
  }, [chainId]);

  return (
    <div>
      <ChainIdContext.Provider value={currentChainId}>
        <h3>The example works only with Metamask extension!</h3>
        <div className="App">
          <br />
          <div className="chain-id-box">
            <label>ChainId:</label>
            <input
              name="chainId"
              value={currentChainId}
              onChange={e => setCurrentChainId(+e.target.value)}
            />
          </div>
          {EXAMPLES.map((props, index) => {
            return <Example key={index} {...props} open={index === 0} />;
          })}
        </div>
      </ChainIdContext.Provider>
    </div>
  );
}

export default App;
