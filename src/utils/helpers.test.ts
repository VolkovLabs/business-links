import { calcOffsetTop, replaceVariablesHelper } from './helpers';

describe('Variable helpers', () => {
  describe('Replace Variables Helper', () => {
    const safeDate = new Date('02-02-2023');
    it('Should collect array values', () => {
      const result = replaceVariablesHelper('array', (value, scopedVars, format) => {
        if (typeof format === 'function') {
          format(['value1', 'value2']);
        }

        return '';
      });

      expect(result).toEqual(['value1', 'value2']);
    });

    it('Should format date to iso string', () => {
      const result = replaceVariablesHelper('__from:date', (value, scopedVars, format) => {
        if (typeof format === 'function') {
          format(safeDate.valueOf());
        }

        return '';
      });

      expect(result).toEqual([safeDate.toISOString()]);
    });

    it('Should format date to unix seconds string', () => {
      const result = replaceVariablesHelper('__to:date:seconds', (value, scopedVars, format) => {
        if (typeof format === 'function') {
          format(safeDate.valueOf());
        }

        return '';
      });

      const timestamp = safeDate.valueOf();
      expect(result).toEqual([(timestamp / 1000).toString()]);
    });

    it('Should format date to custom format', () => {
      const result = replaceVariablesHelper('__from:date:YYYY', (value, scopedVars, format) => {
        if (typeof format === 'function') {
          format(safeDate.valueOf());
        }

        return '';
      });

      expect(result).toEqual(['2023']);

      const result2 = replaceVariablesHelper('__to:date:YYYY', (value, scopedVars, format) => {
        if (typeof format === 'function') {
          format(safeDate.valueOf());
        }

        return '';
      });

      expect(result2).toEqual(['2023']);
    });

    it('Should format date to original value', () => {
      const result = replaceVariablesHelper('__from:123', (value, scopedVars, format) => {
        if (typeof format === 'function') {
          format(safeDate.valueOf());
        }

        return '';
      });

      expect(result).toEqual([safeDate.valueOf()]);
    });

    it('Should return original value', () => {
      const result = replaceVariablesHelper('someName', (value, scopedVars, format) => {
        if (typeof format === 'function') {
          format('123');
        }

        return '';
      });

      expect(result).toEqual(['123']);
    });
  });
});

/**
 * Unit tests for calcOffsetTop utility function.
 */
describe('calcOffsetTop utility', () => {
  let realGetComputedStyle: typeof window.getComputedStyle;

  beforeAll(() => {
    realGetComputedStyle = window.getComputedStyle;
  });
  afterAll(() => {
    window.getComputedStyle = realGetComputedStyle;
  });

  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('Should calculates header + sticky submenu height', () => {
    /**
     * When a sticky submenu is visible, return header height + submenu height.
     */
    const header = document.createElement('header');
    header.getBoundingClientRect = () => ({ height: 20 }) as DOMRect;

    document.body.appendChild(header);
    const submenu = document.createElement('section');

    submenu.setAttribute('aria-label', 'Dashboard submenu');
    submenu.getBoundingClientRect = () => ({ height: 30 }) as DOMRect;

    document.body.appendChild(submenu);
    window.getComputedStyle = (el: Element) => {
      if (el === submenu) {
        return {
          position: 'sticky',
          visibility: 'visible',
          overflow: '',
          overflowX: '',
          overflowY: '',
        } as unknown as CSSStyleDeclaration;
      }
      return {
        position: 'static',
        visibility: 'visible',
        overflow: '',
        overflowX: '',
        overflowY: '',
      } as unknown as CSSStyleDeclaration;
    };
    expect(calcOffsetTop()).toEqual(50);
  });

  it('Should prefers controlsBottom over header+submenu', () => {
    /**
     * If control container is present, return its bottom offset directly.
     */
    const controlsContainer = document.createElement('div');
    controlsContainer.getBoundingClientRect = () => ({ bottom: 40 }) as DOMRect;
    const controlsEl = document.createElement('div');
    controlsEl.setAttribute('data-testid', 'data-testid dashboard controls');
    controlsContainer.appendChild(controlsEl);
    document.body.appendChild(controlsContainer);
    expect(calcOffsetTop()).toEqual(40);
  });
});
