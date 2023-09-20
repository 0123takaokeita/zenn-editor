import markdownToHtml from '../src/index';

describe('<br /> のテスト', () => {
  test('段落内の<br />は保持する', () => {
    const patterns = ['foo<br>bar', 'foo<br/>bar', 'foo<br />bar'];
    patterns.forEach((pattern) => {
      const html = markdownToHtml(pattern);
      expect(html).toMatch(/<p>foo<br \/>bar<\/p>/);
    });
  });
  test('テーブル内の<br />は保持する', () => {
    const tableString = [
      `| a | b |`,
      `| --- | --- |`,
      `| foo<br>bar | c |`,
    ].join('\n');
    const html = markdownToHtml(tableString);
    expect(html).toContain('foo<br />bar');
  });
  test('インラインコード内の<br />はエスケープする', () => {
    const html = markdownToHtml('foo`<br>`bar');
    expect(html).toMatch(/<p>foo<code>&lt;br&gt;<\/code>bar<\/p>/);
  });
  test('コードブロック内の<br />はエスケープする', () => {
    const html = markdownToHtml('```\n<br>\n```');
    expect(html).toContain('&lt;br&gt;');
  });
});
