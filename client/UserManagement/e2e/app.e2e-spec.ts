import { UserManagementPage } from './app.po';

describe('user-management App', () => {
  let page: UserManagementPage;

  beforeEach(() => {
    page = new UserManagementPage();
  });

  it('should display welcome message', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('Welcome to app!');
  });
});
