// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';
const { REACT_APP_ENV } = process.env;
export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    antd: true,
    // default true, when it is true, will use `navigator.language` overwrite default
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    // {
    //   path: '/user',
    //   component: '../layouts/UserLayout',
    //   routes: [
    //     {
    //       name: 'login',
    //       path: '/user/login',
    //       component: './user/login',
    //     },
    //   ],
    // },
    {
      path: '/',
      component: '../layouts/SecurityLayout',
      routes: [
        {
          path: '/',
          component: '../layouts/BasicLayout',
          authority: ['admin', 'user'],
          routes: [
            {
              path: '/',
              redirect: '/welcome',
            },
            {
              path: '/welcome',
              name: 'welcome',
              icon: 'smile',
              component: './Welcome',
            },

            {
              name: 'mapmange',
              icon: 'table',
              path: '/map',
              //component: './ListTableList',
              routes: [
                {
                  name: '版本管理',
                  icon: 'smile',
                  path: '/map/version',
                  component: './ListTableList/VersionManage',
                },

                {
                  name: '文件管理',
                  icon: 'smile',
                  path: '/map/file',
                  component: './ListTableList/FileManage',
                },
                {
                  name: '发布管理',
                  icon: 'smile',
                  path: '/map/release',
                  component: './ListTableList/ReleaseManage',
                },
                {
                  name: 'demo',
                  icon: 'smile',
                  path: '/map/versiondemo',
                  component: './ListTableList/mapmanage',
                },
              ],
            },
            {
              path: '/user',
              name: 'user',
              icon: 'crown',
              //component: './user',
              //authority: ['admin'],
              routes: [
                {
                  name: 'auth',
                  icon: 'smile',
                  path: '/user/auth',
                  component: './user/AuthManage', //  authority: ['admin'],
                },
              ],
            },
            {
              name: '日志管理',
              icon: 'smile',
              path: '/log',
              //  component: './Log',
              routes: [
                {
                  name: '用户访问日志',
                  icon: 'smile',
                  path: '/log/user',
                  component: './Log/UserLog',
                },
                {
                  name: '操作日志',
                  icon: 'smile',
                  path: '/log/operation',
                  component: './Log/Operation',
                },
              ],
            },
            {
              component: './404',
            },
          ],
        },
        {
          component: './404',
        },
      ],
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
