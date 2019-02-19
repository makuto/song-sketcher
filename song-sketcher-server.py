#!/usr/bin/env python

import tornado.ioloop
import tornado.web
import tornado.websocket
import tornado.httpclient
import tornado.gen

import os
# import random
# import shutil
# import json
# import multiprocessing

#
# Tornado handlers
#

class HomeHandler(tornado.web.RequestHandler):
    def get(self):
        self.render('song-sketcher.html')

class UploadHandler(tornado.web.RequestHandler):
    def post(self):
        recording = self.request.files['recording'][0]
        original_filename = recording['filename']

        # TODO Actually look at what type the file is!
        output_file = open('output/' + original_filename + '.ogg', 'wb')
        output_file.write(recording['body'])

        print('File ' + original_filename + ' uploaded')

        self.finish('File ' + original_filename + ' uploaded')

#
# Startup
#

def make_app():
    return tornado.web.Application([
        # Home page
        (r'/', HomeHandler),

        # # Configure the script
        # (r'/settings', SettingsHandler),

        # # Handles messages for run script
        # (r'/runScriptWebSocket', RunScriptWebSocket),

        # # Handles messages for randomImageBrowser
        # (r'/randomImageBrowserWebSocket', RandomImageBrowserWebSocket),

        # Upload handler
        (r'/upload', UploadHandler),

        # # Don't change this 'output' here without changing the other places as well
        (r'/output/(.*)', tornado.web.StaticFileHandler, {'path' : 'output'}),

        # Static files. Keep this at the bottom because it handles everything else
        # TODO put these in a subdir so everything isn't accessible
        (r'/webResources/(.*)', tornado.web.StaticFileHandler, {'path' : 'webResources'}),
    ],
                                   xsrf_cookies=True,
                                   cookie_secret='dooblydoo')

if __name__ == '__main__':
    print('\n\tWARNING: Do NOT run this server on the internet (e.g. port-forwarded)'
          ' nor when\n\t connected to an insecure LAN! It is not protected against malicious use.\n')
    
    port = 8888
    print('\nStarting Song Sketcher Server on port {}...'.format(port))
    app = make_app()
    app.listen(port)
    ioLoop = tornado.ioloop.IOLoop.current()
    # updateStatusCallback = tornado.ioloop.PeriodicCallback(updateScriptStatus, 100)
    # updateStatusCallback.start()
    ioLoop.start()
