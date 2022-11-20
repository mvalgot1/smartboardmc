import React, { Children } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Spinner from '../layout/Spinner';

const PrivateRoute = ({ auth, children }) => {
  if (auth.loading) return <Spinner />;
  if (auth.isAuthenticated) {
    return children;
  }

  return <Navigate to="/login" />;
};

PrivateRoute.propTypes = {
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps)(PrivateRoute);
