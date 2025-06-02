<template>
  <CommonModal
    :closeOnOverlayClick="true"
    :modalClass="modalClass"
    :closeButtonClass="closeButtonClass"
    @close="handleClose"
  >
    <DownloadRdContent @close="handleClose"></DownloadRdContent>
  </CommonModal>
</template>

<script setup>
import { ref } from "vue";
import CommonModal from "../../../util/CommonModal.vue";
import { defineEmits } from "vue";
import DownloadRdContent from "./DownloadRdContent.vue";

const emit = defineEmits(["close"]);

const handleClose = () => {
  emit("close");
};
</script>

<style scoped></style>
