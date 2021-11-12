import React, { useState } from 'react';
import axios, { AxiosError, Method } from 'axios';
import { ServerError } from '../interfaces/custom-error';

const useRequest = ({
  url,
  method,
  body,
  onSuccess,
}: {
  url: string;
  method: Method;
  body: any;
  onSuccess: (arg?: any) => void;
}) => {
  const [errors, setErrors] = useState<React.ReactNode>(null);

  const doRequest = async (props = {}) => {
    try {
      setErrors(null);
      const response = await axios({
        method: method,
        url: url,
        data: { ...body, ...props },
      });

      if (onSuccess) {
        onSuccess(response.data);
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const serverError = error as AxiosError<ServerError>;
        if (serverError && serverError.response) {
          setErrors(
            <div className="alert alert-danger">
              <h4>Ooops....</h4>
              <ul className="my-0">
                {serverError.response.data.errors.map((err) => (
                  <li key={err.message}>{err.message}</li>
                ))}
              </ul>
            </div>
          );
        }
      }
    }
  };

  return { doRequest, errors };
};

export { useRequest };
