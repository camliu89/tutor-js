import { autorun } from 'mobx';
import Factory from '../factories';
import { sample } from 'lodash';
import Node from '../../src/models/reference-book/node';


describe('Reference Book', () => {
  let book;
  beforeEach(() => {
    book = Factory.book({ type: 'biology' });
  });

  it('maps pages and updates when the model changes', () => {
    const recomputeSpy = jest.fn();
    autorun(() => recomputeSpy(book.pages));
    const page_ids = Array.from(book.pages.byId.keys());
    const oldId = sample(page_ids);
    const page = book.pages.byId.get(oldId);
    expect(book.pages.byId.keys()).toContain(oldId);
    expect(recomputeSpy).toHaveBeenCalledTimes(1);
    page.id = '99999';
    expect(book.pages.byId.keys()).not.toContain(oldId);
    expect(book.pages.byId.keys()).toContain(page.id);
    expect(recomputeSpy).toHaveBeenCalledTimes(2);
  });

  it('reads 2 level toc', () => {
    book = Factory.book({ type: 'physics' });
    expect(book.children[0]).toBeInstanceOf(Node);
    book.chapters.forEach(c => expect(c.isChapter).toBe(true));
  });

  it('reads 3 level toc', () => {
    expect(book.children[0]).toBeInstanceOf(Node);
    expect(book.children[1].children[0].book).toBe(book);
    book.chapters.forEach(c => expect(c.isChapter).toBe(true));
  });

});
