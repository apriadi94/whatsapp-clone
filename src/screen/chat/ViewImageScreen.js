import React, { useEffect } from 'react'
import {  Modal } from 'react-native'
import ImageViewer from 'react-native-image-zoom-viewer';

const ViewImageScreen = ({ navigation, route }) => {
    const { gambar } = route.params

    return(
        <Modal visible={true} transparent={true} onRequestClose={() => navigation.goBack()} >
            <ImageViewer imageUrls={gambar} backgroundColor={'white'} index={0}/>
        </Modal>
    )
}

export default ViewImageScreen;