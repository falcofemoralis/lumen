import { useCallback, useEffect, useRef, useState } from 'react';
import { CloudflareSolveOutcome, registerCloudflareSolver } from 'Util/Cloudflare';

import CloudflareSolverComponent from './CloudflareSolver.component';
import { CloudflareSolveRequest } from './CloudflareSolver.type';

/**
 * The app's standing offer to work a Cloudflare bot check.
 *
 * Challenges are met deep inside `customFetch`, which has no React tree to reach into,
 * while the only thing that can pass one is a mounted browser view. This bridges the
 * two: it registers itself with `Util/Cloudflare` on mount, and every solve that module
 * is asked for turns into a hidden WebView here, mounted for the seconds it takes and
 * then gone.
 *
 * Rendered from `Root`, so it outlives navigation -- a challenge can be hit on any
 * screen, and by a background refresh with no screen at all.
 *
 * Nothing is drawn when there is nothing to solve, which is nearly always.
 */
export const CloudflareSolverContainer = () => {
  const [requests, setRequests] = useState<CloudflareSolveRequest[]>([]);
  const nextId = useRef(0);

  useEffect(() => {
    registerCloudflareSolver((origin, userAgent) => new Promise<CloudflareSolveOutcome>((resolve) => {
      nextId.current += 1;

      setRequests((current) => [...current, { id: nextId.current, origin, userAgent, resolve }]);
    }));

    // Leaves `Util/Cloudflare` with nothing registered, so a solve asked for while this
    // is unmounted fails immediately instead of waiting out a WebView that is not
    // coming. That is the honest answer in a headless background task.
    return () => {
      registerCloudflareSolver(null);
    };
  }, []);

  const onSettled = useCallback((request: CloudflareSolveRequest, outcome: CloudflareSolveOutcome) => {
    setRequests((current) => current.filter(({ id }) => id !== request.id));

    // Releases the `customFetch` call that has been waiting on this, which retries the
    // request that hit the challenge in the first place.
    request.resolve(outcome);
  }, []);

  // Empty nearly always, and then this draws nothing at all.
  return requests.map((request) => (
    <CloudflareSolverComponent
      key={ request.id }
      request={ request }
      onSettled={ onSettled }
    />
  ));
};

export default CloudflareSolverContainer;
