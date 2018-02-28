// @flow

import React, { Component } from 'react';
import Search from './Search/';
import Table from './Table/index';
import './App.css';
import Button from './Button/';
import fetch from 'isomorphic-fetch';

const DEFAULT_QUERY = 'redux';
const DEFAULT_HPP = '100';

const PATH_BASE = 'https://hn.algolia.com/api/v1';
const PATH_SEARCH = '/search';
const PARAM_SEARCH = 'query=';
const PARAM_PAGE = 'page=';
const PARAM_HPP = 'hitsPerPage=';

type Props = {
  foo: number
};

type State = {
  searchTerm: string,
  currentPage: number,
  result: Result,
  cache: Object,
  error: ?Object
};

type Result = {
  hits: Object,
  page: number,
  nbPages: number
};

class App extends Component<Props, State> {
  setSearchTopStories: (result: Result, updateCache: boolean) => void;
  fetchSearchTopStories: (searchTerm: string, currentPage: number) => void;
  onDismiss: () => void;
  onSearchChange: () => void;
  onSearchSubmit: () => void;
  onReset: () => void;
  nextPage: () => void;

  constructor(props: Props) {
    super(props);
    this.state = {
      searchTerm: DEFAULT_QUERY,
      currentPage: 0,
      cache: {},
      result: {
        hits: {},
        page: 0,
        nbPages: 0
      },
      error: null
    };

    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.onReset = this.onReset.bind(this);
    this.nextPage = this.nextPage.bind(this);
  }

  componentDidMount() {
    const { searchTerm, currentPage } = this.state;
    this.fetchSearchTopStories(searchTerm, currentPage);
  }

  render() {
    const { searchTerm, result, currentPage, error } = this.state;

    const totPages = result ? result.nbPages : 0;

    return (
      <div className="page">
        <span>HELLO</span>
        <div className="interactions">
          <Search
            searchTerm={searchTerm}
            onSearchChange={this.onSearchChange}
            onSearchSubmit={this.onSearchSubmit}
            onReset={this.onReset}
          >
            Search
          </Search>
        </div>
        {error ? (
          <div className="interactions">
            <p>Application Error: {error.message}</p>
          </div>
        ) : (
          result && (
            <Table
              list={result.hits}
              searchTerm={searchTerm}
              onDismiss={this.onDismiss}
            />
          )
        )}

        {currentPage < totPages && (
          <Button onClick={this.nextPage}> More Articles </Button>
        )}
      </div>
    );
  }

  nextPage() {
    const { searchTerm, currentPage, result } = this.state;
    const totPages = result.nbPages;

    if (currentPage < totPages) {
      this.setState({
        currentPage: currentPage + 1
      });
    }

    this.fetchSearchTopStories(searchTerm, currentPage + 1);
  }

  setSearchTopStories(result: Result, updateCache: boolean) {
    const { hits, page, nbPages } = result;
    const oldHits = page !== 0 ? this.state.result.hits : [];
    const updatedHits = [...oldHits, ...hits];

    let { cache } = this.state;
    if (updateCache) {
      if (!cache[this.state.searchTerm]) {
        cache[this.state.searchTerm] = { pages: [] };
      }
      cache[this.state.searchTerm]['pages'][page] = result;
    }

    this.setState({
      result: { hits: updatedHits, page, nbPages },
      cache: cache
    });
  }

  fetchSearchTopStories(searchTerm: string, currentPage: number) {
    const { cache } = this.state;

    cache[searchTerm] && cache[searchTerm]['pages'][currentPage]
      ? this.setSearchTopStories(cache[searchTerm]['pages'][currentPage], false)
      : fetch(
          `${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${currentPage}&${PARAM_HPP}${DEFAULT_HPP}`
        )
          .then(response => response.json())
          .then(result => this.setSearchTopStories(result, true))
          .catch(e => this.setState({ error: e }));
  }

  onDismiss(itemId: number) {
    const updatedHits = this.state.result.hits.filter(item => {
      return item.objectID !== itemId;
    });

    this.setState({
      result: { ...this.state.result, hits: updatedHits }
    });
  }

  onSearchChange(event: Object) {
    this.setState({ searchTerm: event.target.value });
  }

  onSearchSubmit(event: Object) {
    this.setState({ currentPage: 0 });
    const { searchTerm } = this.state;
    this.fetchSearchTopStories(searchTerm, 0);
    event.preventDefault();
  }

  onReset() {
    this.setState({
      result: {
        hits: {},
        page: 0,
        nbPages: 0
      },
      searchTerm: ''
    });
  }
}

export default App;
