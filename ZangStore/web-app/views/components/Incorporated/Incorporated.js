import React from 'react';
import './Incorporated.css';


const Incorporated = (props) => {
    const { onChange, error } = props;
    return (
        <div>
            <label>{global.localizer.get('COMPANY_IS_INCORPORATED')}</label>
            <div className="quote-incorporated-radio" >
                <label className="radio-inline">{global.localizer.get('YES')}</label>
                <input name='company.isIncorporated' onChange={onChange} type="radio" value={true} />
                <label className="radio-inline">{global.localizer.get('NO')}</label>
                <input name='company.isIncorporated' onChange={onChange} type="radio" value={false} />
            </div>
            {error ? <span className="error-msg" style={{ 'color': 'red' }}>{error}</span> : null}
        </div>
    );
};

export default Incorporated;

