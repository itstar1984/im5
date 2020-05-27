'use strict';

/**
 * Module dependencies.
 */
var acl = require('acl');

// Using the memory backend
acl = new acl(new acl.memoryBackend());

/**
 * Invoke presentacions Permissions
 */
exports.invokeRolesPolicies = function() {
    acl.allow([{
        roles: ['groso', 'admin'],
        allows: [{
            resources: '/api/presentacion',
            permissions: '*'
        }, {
            resources: '/api/presentacion/updateTotal',
            permissions: '*'
        }, {
            resources: '/api/presentacion/:presentacionId',
            permissions: '*'
        }, {
            resources: '/api/presentacion/ajustar',
            permissions: '*'
        }]
    }, {
        roles: ['user'],
        allows: [{
            resources: '/api/presentacion',
            permissions: ['get', 'post']
        }, {
            resources: '/api/presentacion/updateTotal',
            permissions: ['put', 'post']
        }, {
            resources: '/api/presentacion/:presentacionId',
            permissions: ['get']
        }, {
            resources: '/api/presentacion/ajustar',
            permissions: ['get', 'put']
        }]
    }]);
};

/**
 * Check If Articles Policy Allows
 */
exports.isAllowed = function(req, res, next) {
    var roles = (req.user) ? req.user.roles : ['guest'];

    // If an rrhh is being processed and the current user created it then allow any manipulation
    if (req.rrhh && req.user && req.rrhh.user.id === req.user.id) {
        return next();
    }

    // Check for user roles
    acl.areAnyRolesAllowed(roles, req.route.path, req.method.toLowerCase(), function(err, isAllowed) {
        if (err) {
            // An authorization error occurred.
            return res.status(500).send('Unexpected authorization error');
        } else {
            if (isAllowed) {
                // Access granted! Invoke next middleware
                return next();
            } else {
                return res.status(403).json({
                    message: 'User is not authorized'
                });
            }
        }
    });
};
