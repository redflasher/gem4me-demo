/**
 * @author v.lugovsky
 * created on 16.12.2015
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages', [
    'ui.router',

    'BlurAdmin.pages.dashboard',
    'BlurAdmin.pages.ui',
    'BlurAdmin.pages.components',
    'BlurAdmin.pages.form',
    'BlurAdmin.pages.tables',
    'BlurAdmin.pages.profile',
  ])
      .config(routeConfig);

  /** @ngInject */
  function routeConfig($urlRouterProvider, baSidebarServiceProvider, $httpProvider) {

    var token = getCookie("token");
    if( token == "" || token == undefined || token == null ) {
      window.location = "/auth.html";
    }

    $httpProvider.interceptors.push(function($q, $rootScope) {
      return {
        // см. http://stepansuvorov.com/blog/2014/04/angularjs-interceptors-примеры/
        request: function(request) {
          if( !$rootScope.noNotification ) {
            $rootScope.loading = true;
          }
          return request;
        },

        response: function(response) {
          if(response.data == "404") {
            window.location = "/404";
            return response;
          } else {
            $rootScope.loading = false;
            return response;
          }
        },
        requestError: function(requestError) {
          console.log("requestError",requestError, $rootScope.noNotification);
          $rootScope.loading = false;
          if( !$rootScope.noNotification ) {
            $rootScope.$broadcast("showError", "Не удалось соединиться с сервером.");
          }
        },
        // This is the responseError interceptor
        responseError: function(responseError) {
          console.log(responseError.status);
          $rootScope.$broadcast("errorCode", responseError.status);
          if( responseError.status == 404 ) return responseError;
          if( responseError.status == 401 ) {
            // TODO: продолжить отсюда
            // обновить скрипты на сервере и протестировать их работу.
            $rootScope.$broadcast("showError", "Бот с таким токеном не найден.");
            return responseError;
          }

          $rootScope.loading = false;
          if( !$rootScope.noNotification ) {
            $rootScope.$broadcast("showError", "Не удалось соединиться с сервером.");
          }
          if (responseError.status > 399) { // assuming that any code over 399 is an error
            $q.reject(responseError);
          }

          return responseError;
        }
      };
    });

    $urlRouterProvider.otherwise('/index');

  }


  //cookies
  function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
      var d = new Date();
      d.setTime(d.getTime() + expires * 1000);
      expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
      options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
      updatedCookie += "; " + propName;
      var propValue = options[propName];
      if (propValue !== true) {
        updatedCookie += "=" + propValue;
      }
    }

    document.cookie = updatedCookie;
  }

  function getCookie(name) {
    var matches = document.cookie.match(new RegExp(
      "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
  }


})

();
