import path from 'path';
import { exec } from '../../commands/init';
import * as helper from '../../lib/helper';
import { initHelpText } from '../../lib/messages';

describe('initコマンドのテスト', () => {
  beforeEach(() => {
    // mock
    jest.spyOn(helper, 'generateFileIfNotExist').mockImplementation();
    console.log = jest.fn();
    console.error = jest.fn();
  });

  test('ディレクトリに対して generateFileIfNotExist を実行する', () => {
    exec([]);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(path.join(process.cwd(), 'articles/.keep')),
      expect.stringMatching(/^$/)
    );
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(path.join(process.cwd(), 'books/.keep')),
      expect.stringMatching(/^$/)
    );
  });

  test('.gitignore に対して generateFileIfNotExist を実行する', () => {
    exec([]);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(path.join(process.cwd(), '.gitignore')),
      expect.stringContaining(['node_modules', '.DS_Store'].join('\n'))
    );
  });

  test('README に対して generateFileIfNotExist を実行する', () => {
    exec([]);
    expect(helper.generateFileIfNotExist).toHaveBeenCalledWith(
      expect.stringContaining(path.join(process.cwd(), 'README.md')),
      expect.stringContaining('Zenn CLI')
    );
  });

  test('成功メッセージを表示する', () => {
    exec([]);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining('🎉  Done!')
    );
  });

  test('--helpでもヘルプメッセージを表示する', () => {
    exec(['--help']);
    expect(console.log).toHaveBeenCalledWith(
      expect.stringContaining(initHelpText)
    );
  });
});
